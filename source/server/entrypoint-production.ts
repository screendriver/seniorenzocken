import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { migrate } from "drizzle-orm/libsql/migrator";
import { serve } from "@hono/node-server";
import { all } from "true-myth/task";
import { Cron } from "croner";
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

const infisicalSDK = createInfisicalSDK(infisicalAccessToken.trim());
const secretsClient = createSecretsClient({ infisicalSDK });
const secretsRepository = createSecretsRepository({ secretsClient });

const prometheusSecretsResult = await secretsRepository.getPrometheusSecrets();
const prometheusSecrets = prometheusSecretsResult.unwrapOrElse((error) => {
	throw new Error("Could not fetch Prometheus secrets", { cause: error });
});
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
const trpcRouter = createTrpcRouter();
const trpcApplicationRouter = createTrpcApplicationRouter({
	trpcRouter,
	database,
	audioRepository,
	playersRepository,
	isTurnAround
});
const sessionRepository = createSessionRepository({ database, randomUUID });
const server = createServer({
	clock,
	database,
	trpcApplicationRouter,
	sessionRepository,
	metricsUsername: prometheusSecrets.username,
	metricsPassword: prometheusSecrets.password,
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
