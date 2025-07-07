import { seed } from "drizzle-seed";
import type { Client } from "@libsql/client";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./database/schema.ts";

const seedNumber = 42;

export async function seedInMemoryDatabase(database: LibSQLDatabase<typeof schema> & { $client: Client }) {
	// @ts-expect-error currently a bug in drizzle-seed
	await seed(database, { players: schema.players }, { seed: seedNumber }).refine((drizzleSeed) => {
		return {
			players: {
				count: 8,
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

	await database.insert(schema.teams).values({ player1Id: 1, player2Id: 3 });

	await database.insert(schema.teams).values({ player1Id: 5, player2Id: 8 });

	await database.insert(schema.games).values({
		datePlayed: "2025-07-07 09:18:00.000+02:00",
		team1Id: 1,
		team2Id: 2,
		team1Points: 15,
		team2Points: 7,
	});

	await database.insert(schema.games).values({
		datePlayed: "2025-07-05 19:35:00.000+02:00",
		team1Id: 1,
		team2Id: 2,
		team1Points: 8,
		team2Points: 15,
	});
}
