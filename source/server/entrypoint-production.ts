import { migrate } from "drizzle-orm/libsql/migrator";
import { serve } from "@hono/node-server";
import { parse, pipe, string, nonEmpty } from "valibot";
import { readFile } from "node:fs/promises";
import { createDatabase } from "./database/database.ts";
import { createServer } from "./server.ts";
import { createAudioRepository } from "./audio/repository.ts";
import { createTrpcRouter } from "./trpc-router.ts";

const database = createDatabase("file:database.sqlite");

await migrate(database, { migrationsFolder: "./drizzle" });

const nonEmptyStringSchema = pipe(string(), nonEmpty());
const metricsUsernameFile = parse(nonEmptyStringSchema, process.env.METRICS_USERNAME_FILE);
const metricsPasswordFile = parse(nonEmptyStringSchema, process.env.METRICS_PASSWORD_FILE);
const [metricsUsername, metricsPassword] = await Promise.all([
	readFile(metricsUsernameFile, { encoding: "utf8" }),
	readFile(metricsPasswordFile, { encoding: "utf8" }),
]);

const audioRepository = createAudioRepository({ database });
const trpcRouter = createTrpcRouter({ database, audioRepository });
const server = createServer({ database, trpcRouter, metricsUsername, metricsPassword });

serve(
	{
		fetch: server.fetch,
		port: 4000,
	},
	() => {
		console.info("Server is running on http://localhost:4000");
	},
);
