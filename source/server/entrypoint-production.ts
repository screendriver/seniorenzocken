import { randomUUID } from "node:crypto";
import { migrate } from "drizzle-orm/libsql/migrator";
import { serve } from "@hono/node-server";
import { Cron } from "croner";
import { createWallClock } from "@enormora/wall-clock/wall-clock";
import { createDatabase } from "./database/database.js";
import { createServer } from "./server.js";
import { createAudioRepository } from "./audio/repository.js";
import { createPlayersRepository } from "./players/players-repository.js";
import { isTurnAround } from "./audio/turn_around.js";
import { createTrpcRouter } from "./trpc/index.js";
import { createTrpcApplicationRouter } from "./trpc/application-router.js";
import { readRequiredSecret } from "./read-required-secret.js";
import { createSessionRepository } from "./session/session-repository.js";
import { startCleanupDatabaseCronJob } from "./database/cleanup.js";

const seniorenzockenUsernameSecretPath = "/run/secrets/seniorenzocken_username";
const seniorenzockenPasswordSecretPath = "/run/secrets/seniorenzocken_password";

const [seniorenzockenUsername, seniorenzockenPassword] = await Promise.all([
	readRequiredSecret(seniorenzockenUsernameSecretPath),
	readRequiredSecret(seniorenzockenPasswordSecretPath)
]);

const clock = createWallClock();

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
	seniorenzockenUsername,
	seniorenzockenPassword,
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
