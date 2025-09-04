import { describe, it, expect, assert } from "vitest";
import { isErr, isOk } from "true-myth/result";
import { migrate } from "drizzle-orm/libsql/migrator";
import { stripIndent } from "common-tags";
import { createDatabase } from "../database/database.js";
import { players as playersDatabaseSchema } from "../database/schema.js";
import { createPlayersRepository } from "./players-repository.js";

describe("allPlayers()", () => {
	it("returns an Result Err when database selection failed", async () => {
		const database = createDatabase(":memory:");
		const playersRepository = createPlayersRepository({ database });

		const result = await playersRepository.allPlayers;

		assert(isErr(result));

		expect(result.error.message).toBe("Could not retrieve all players from database");
	});

	it("returns an Result Err when database returned invalid data", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database
			.insert(playersDatabaseSchema)
			.values({ playerId: 1, firstName: "", lastName: "Doe", nickname: "Player" });
		const playersRepository = createPlayersRepository({ database });

		const result = await playersRepository.allPlayers;

		assert(isErr(result));

		expect(result.error.message).toBe(stripIndent`
			× Invalid length: Expected !0 but received 0
			  → at 0.firstName
		`);
	});

	it("returns an Result Ok with all players", async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database
			.insert(playersDatabaseSchema)
			.values({ playerId: 1, firstName: "John", lastName: "Doe", nickname: "Player" });
		const playersRepository = createPlayersRepository({ database });

		const result = await playersRepository.allPlayers;

		assert(isOk(result));

		expect(result.value).toStrictEqual([
			{
				firstName: "John",
				lastName: "Doe",
				nickname: "Player",
				playerId: 1,
				totalGamesCount: 0,
				totalPoints: 0
			}
		]);
	});
});
