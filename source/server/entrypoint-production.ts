import { migrate } from "drizzle-orm/libsql/migrator";
import { createDatabase } from "./database/database.ts";
import { createServer } from "./server.ts";

const database = createDatabase("file:database.sqlite");

await migrate(database, { migrationsFolder: "./drizzle" });

createServer({
	cors: {
		origin: "https://www.seniorenzocken.net",
		methods: ["POST"],
	},
	database,
});
