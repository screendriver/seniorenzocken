import assert from "node:assert";
import { suite, test } from "mocha";
import { isErr, isOk } from "true-myth/result";
import { migrate } from "drizzle-orm/libsql/migrator";
import { stripIndent } from "common-tags";
import { createDatabase } from "../database/database.js";
import { players as playersDatabaseSchema } from "../database/raw-database-schema.js";
import { createPlayersRepository } from "./players-repository.js";

suite("allPlayers()", function () {
	test("returns an Result Err when database selection failed", async function () {
		const database = createDatabase(":memory:");
		const playersRepository = createPlayersRepository({ database });

		const result = await playersRepository.allPlayers;

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, "Could not retrieve all players from database");
	});

	test("returns an Result Err when database returned invalid data", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database
			.insert(playersDatabaseSchema)
			.values({ playerId: 1, firstName: "", lastName: "Doe", nickname: "Player" });
		const playersRepository = createPlayersRepository({ database });

		const result = await playersRepository.allPlayers;

		assert.ok(isErr(result));

		assert.strictEqual(
			result.error.message,
			stripIndent`
			× Invalid length: Expected !0 but received 0
			  → at 0.firstName
		`
		);
	});

	test("returns an Result Ok with all players", async function () {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await database
			.insert(playersDatabaseSchema)
			.values({ playerId: 1, firstName: "John", lastName: "Doe", nickname: "Player" });
		const playersRepository = createPlayersRepository({ database });

		const result = await playersRepository.allPlayers;

		assert.ok(isOk(result));

		assert.deepStrictEqual(result.value, [
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
