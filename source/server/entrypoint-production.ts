import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { migrate } from "drizzle-orm/libsql/migrator";
import { serve } from "@hono/node-server";
import { all } from "true-myth/task";
import { Cron } from "croner";
import pino from "pino";
import { createClock } from "./clock/clock.js";
import { createDatabase } from "./database/database.js";
import { createServer } from "./server.js";
import { createAudioRepository } from "./audio/repository.js";
import { createPlayersRepository } from "./players/players-repository.js";
import { isTurnAround } from "./audio/turn_around.js";
import { createTrpcRouter } from "./trpc/index.js";
import { createTrpcApplicationRouter } from "./trpc/application-router.js";
import { createInfisicalSDK } from "./secrets/infisical/infisical-sdk.js";
import { createSecretsClient } from "./secrets/secrets-client.js";
import { createSecretsRepository } from "./secrets/secrets-repository.js";
import { createSessionRepository } from "./session/session-repository.js";
import { startCleanupDatabaseCronJob } from "./database/cleanup.js";

const infisicalAccessToken = await readFile("/run/secrets/infisical_access_token", "utf8");

const logger = pino({ base: null });
const infisicalSDK = createInfisicalSDK(infisicalAccessToken.trim());
const secretsClient = createSecretsClient({
	infisicalSDK,
	retryOptions: {
		retries: Number.POSITIVE_INFINITY,
		minTimeout: 2000,
		maxTimeout: 30_000,
		maxRetryTime: 300_000,
		factor: 2
	},
	logRetry(retryContext) {
		const { attemptNumber, retryDelay, retriesLeft, error } = retryContext;

		logger.warn({ attemptNumber, retryDelay, retriesLeft, error }, "Could not fetch Infisical secret; retrying");
	}
});
const secretsRepository = createSecretsRepository({ secretsClient });

const seniorenzockenSecretsResult = await all([
	secretsRepository.getSecret("SENIORENZOCKEN_USERNAME"),
	secretsRepository.getSecret("SENIORENZOCKEN_PASSWORD")
]).map((secrets) => {
	return { seniorenzockenUsername: secrets[0], seniorenzockenPassword: secrets[1] };
});
const seniorenzockenSecrets = seniorenzockenSecretsResult.unwrapOrElse((error) => {
	throw new Error("Could not fetch Seniorenzocken secrets", { cause: error });
});

const clock = createClock();

const database = createDatabase("file:database.sqlite");

await migrate(database, { migrationsFolder: "./drizzle" });

startCleanupDatabaseCronJob({ Cron, database });

const audioRepository = createAudioRepository({ database });
const playersRepository = createPlayersRepository({ database });
const sessionRepository = createSessionRepository({ database, randomUUID });
const trpcRouter = createTrpcRouter();
const trpcApplicationRouter = createTrpcApplicationRouter({
	trpcRouter,
	database,
	audioRepository,
	playersRepository,
	sessionRepository,
	isTurnAround
});
const server = createServer({
	clock,
	database,
	trpcApplicationRouter,
	sessionRepository,
	browserApplicationPath: "./browser-application",
	seniorenzockenUsername: seniorenzockenSecrets.seniorenzockenUsername,
	seniorenzockenPassword: seniorenzockenSecrets.seniorenzockenPassword,
	isRunningInProduction: true
});

serve(
	{
		fetch: server.fetch,
		port: 4000
	},
	(info) => {
		console.info(`Server is running on http://localhost:${info.port.toString(10)}`);
	}
);
