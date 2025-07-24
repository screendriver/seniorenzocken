import { migrate } from "drizzle-orm/libsql/migrator";
import { serve } from "@hono/node-server";
import { createDatabase } from "./database/database.ts";
import { createServer } from "./server.ts";
import { seedInMemoryDatabase } from "./seed-in-memory-database.ts";
import { createAudioRepository } from "./audio/repository.ts";
import { isTurnAround } from "./audio/turn_around.ts";
import { createTrpcRouter } from "./trpc/index.ts";
import { createTrpcApplicationRouter } from "./trpc/application-router.ts";

const database = createDatabase(":memory:");

await migrate(database, { migrationsFolder: "./drizzle" });

await seedInMemoryDatabase(database);

const audioRepository = createAudioRepository({ database });
const trpcRouter = createTrpcRouter();
const trpcApplicationRouter = createTrpcApplicationRouter({ trpcRouter, database, audioRepository, isTurnAround });
const server = createServer({ database, trpcApplicationRouter, metricsUsername: "foo", metricsPassword: "bar" });

serve(
	{
		fetch: server.fetch,
		port: 4000,
	},
	(info) => {
		console.info(`Server is running on http://localhost:${info.port.toString(10)}`);
	},
);
