import { migrate } from "drizzle-orm/libsql/migrator";
import { serve } from "@hono/node-server";
import { createDatabase } from "./database/database.ts";
import { createServer } from "./server.ts";
import { seedInMemoryDatabase } from "./seed-in-memory-database.ts";
import { createAudioRepository } from "./audio/repository.ts";
import { createTrpcRouter } from "./trpc-router.ts";

const database = createDatabase(":memory:");

await migrate(database, { migrationsFolder: "./drizzle" });

await seedInMemoryDatabase(database);

const audioRepository = createAudioRepository({ database });
const trpcRouter = createTrpcRouter({ database, audioRepository });
const server = createServer({ database, trpcRouter, metricsUsername: "foo", metricsPassword: "bar" });

serve(
	{
		fetch: server.fetch,
		port: 4000,
	},
	() => {
		console.info("Server is running on http://localhost:4000");
	},
);
