import { migrate } from "drizzle-orm/libsql/migrator";
import { createDatabase } from "./database/database.ts";
import { createServer } from "./server.ts";
import { seedInMemoryDatabase } from "./seed-in-memory-database.ts";

const database = createDatabase(":memory:");

await migrate(database, { migrationsFolder: "./drizzle" });

await seedInMemoryDatabase(database);

createServer({
	cors: false,
});
