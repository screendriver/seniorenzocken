import { migrate } from "drizzle-orm/libsql/migrator";
import { serve } from "@hono/node-server";
import { createFakeClock } from "./clock/fake-clock.js";
import { createDatabase } from "./database/database.js";
import { createServer } from "./server.js";
import { seedInMemoryDatabase } from "./seed-in-memory-database.js";
import { createAudioRepository } from "./audio/repository.js";
import { isTurnAround } from "./audio/turn_around.js";
import { createTrpcRouter } from "./trpc/index.js";
import { createTrpcApplicationRouter } from "./trpc/application-router.js";

const fakeClock = createFakeClock();

const database = createDatabase(":memory:");

await migrate(database, { migrationsFolder: "./drizzle" });

await seedInMemoryDatabase(database);

const audioRepository = createAudioRepository({ database });
const trpcRouter = createTrpcRouter();
const trpcApplicationRouter = createTrpcApplicationRouter({ trpcRouter, database, audioRepository, isTurnAround });
const server = createServer({
	clock: fakeClock,
	database,
	trpcApplicationRouter,
	metricsUsername: "foo",
	metricsPassword: "bar",
});

serve(
	{
		fetch: server.fetch,
		port: 4000,
	},
	(info) => {
		console.info(`Server is running on http://localhost:${info.port.toString(10)}`);
	},
);
