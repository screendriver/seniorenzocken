import { seed } from "drizzle-seed";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDatabase } from "./database/database.ts";
import { createServer } from "./server.ts";
import { players } from "./database/schema.ts";

const database = createDatabase(":memory:");

await migrate(database, { migrationsFolder: "./drizzle" });

await seed(database, { players }, { count: 8, seed: 42 }).refine((drizzleSeed) => {
	return {
		players: {
			columns: {
				totalGamePoints: drizzleSeed.int({
					minValue: 0,
					maxValue: 100,
				}),
				totalGameRounds: drizzleSeed.int({
					minValue: 0,
					maxValue: 100,
				}),
			},
		},
	};
});

createServer({
	cors: false,
});
