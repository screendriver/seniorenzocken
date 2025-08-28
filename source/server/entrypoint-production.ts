import { readFile } from "node:fs/promises";
import { migrate } from "drizzle-orm/libsql/migrator";
import { serve } from "@hono/node-server";
import { createClock } from "./clock/clock.js";
import { createDatabase } from "./database/database.js";
import { createServer } from "./server.js";
import { createAudioRepository } from "./audio/repository.js";
import { isTurnAround } from "./audio/turn_around.js";
import { createTrpcRouter } from "./trpc/index.js";
import { createTrpcApplicationRouter } from "./trpc/application-router.js";
import { createInfisicalSDK } from "./secrets/infisical/infisical-sdk.js";
import { createSecretsClient } from "./secrets/secrets-client.js";
import { createSecretsRepository } from "./secrets/secrets-repository.js";

const infisicalAccessToken = await readFile("/run/secrets/infisical_access_token", "utf8");

const infisicalSDK = createInfisicalSDK(infisicalAccessToken.trim());
const secretsClient = createSecretsClient({ infisicalSDK });
const secretsRepository = createSecretsRepository({ secretsClient });

const prometheusSecretsResult = await secretsRepository.getPrometheusSecrets();
const prometheusSecrets = prometheusSecretsResult.unwrapOrElse((error) => {
	throw new Error("Could not fetch Prometheus secrets", { cause: error });
});

const clock = createClock();

const database = createDatabase("file:database.sqlite");

await migrate(database, { migrationsFolder: "./drizzle" });

const audioRepository = createAudioRepository({ database });
const trpcRouter = createTrpcRouter();
const trpcApplicationRouter = createTrpcApplicationRouter({ trpcRouter, database, audioRepository, isTurnAround });
const server = createServer({
	clock,
	database,
	trpcApplicationRouter,
	metricsUsername: prometheusSecrets.username,
	metricsPassword: prometheusSecrets.password
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
