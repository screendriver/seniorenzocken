import { migrate } from "drizzle-orm/libsql/migrator";
import { serve } from "@hono/node-server";
import { createDatabase } from "./database/database.ts";
import { createServer } from "./server.ts";
import { seedInMemoryDatabase } from "./seed-in-memory-database.ts";
import { createTrpcRouter } from "./trpc-router.ts";

const database = createDatabase(":memory:");

await migrate(database, { migrationsFolder: "./drizzle" });

await seedInMemoryDatabase(database);

const trpcRouter = createTrpcRouter({ database });
const server = createServer({ enableCors: true, database, trpcRouter });

serve(
	{
		fetch: server.fetch,
		port: 4000,
	},
	() => {
		console.info("Server is running on http://localhost:4000");
	},
);
