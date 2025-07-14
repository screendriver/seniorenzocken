import { migrate } from "drizzle-orm/libsql/migrator";
import { serve } from "@hono/node-server";
import { createDatabase } from "./database/database.ts";
import { createServer } from "./server.ts";
import { createAudioRepository } from "./audio/repository.ts";
import { createTrpcRouter } from "./trpc-router.ts";

const database = createDatabase("file:database.sqlite");

await migrate(database, { migrationsFolder: "./drizzle" });

const audioRepository = createAudioRepository({ database });
const trpcRouter = createTrpcRouter({ database, audioRepository });
const server = createServer({ database, trpcRouter });

serve(
	{
		fetch: server.fetch,
		port: 4000,
	},
	() => {
		console.info("Server is running on http://localhost:4000");
	},
);
