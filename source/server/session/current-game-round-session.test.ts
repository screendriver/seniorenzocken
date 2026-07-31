import assert from "node:assert";
import { suite, test } from "mocha";
import { just, nothing } from "true-myth/maybe";
import { Factory } from "fishery";
import type {
	CurrentGameRoundSessionDatabaseSelect,
	CurrentGameRoundSessionsDatabaseSelect
} from "./session-database-schema.js";
import { mapCurrentGameRoundSessionsFromDatabase } from "./current-game-round-session.js";

const currentGameRoundSessionDatabaseSelectFactory = Factory.define<CurrentGameRoundSessionDatabaseSelect>(() => {
	return {
		teamId: 1,
		playerId: 1,
		playerNickname: "first",
		playerFirstName: "first-name",
		gamePoints: nothing(),
		hasPreviousGameRounds: false
	};
});

suite("mapCurrentGameRoundSessionsFromDatabase()", function () {
	test("returns an array of team names grouped by team id", function () {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 1, playerId: 1, playerNickname: "first" }),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 2, playerNickname: "third" }),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 1, playerId: 3, playerNickname: "second" }),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 4, playerNickname: "fourth" })
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		assert.deepStrictEqual(actual, {
			teams: [
				{ teamId: 1, name: "first / second", gamePoints: 0 },
				{ teamId: 2, name: "third / fourth", gamePoints: 0 }
			],
			gamePointsPerRound: [0, 2, 3, 4],
			hasPreviousGameRounds: false,
			isGameOver: false
		});
	});

	test("sums up game points per team when there is only one game round", function () {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 1,
				playerNickname: "first",
				gamePoints: just(2)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 2,
				playerNickname: "second",
				gamePoints: just(2)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 2,
				playerId: 3,
				playerNickname: "third",
				gamePoints: nothing()
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 2,
				playerId: 4,
				playerNickname: "fourth",
				gamePoints: nothing()
			})
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		assert.deepStrictEqual(actual, {
			...actual,

			teams: [
				{ teamId: 1, name: "first / second", gamePoints: 2 },
				{ teamId: 2, name: "third / fourth", gamePoints: 0 }
			]
		});
	});

	test("sums up game points per team when there are multiple game rounds", function () {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 1,
				playerNickname: "first",
				gamePoints: just(2)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 1,
				playerNickname: "first",
				gamePoints: just(4)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 2,
				playerNickname: "second",
				gamePoints: just(2)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 2,
				playerNickname: "second",
				gamePoints: just(4)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 2,
				playerId: 3,
				playerNickname: "third",
				gamePoints: just(0)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 2,
				playerId: 4,
				playerNickname: "fourth",
				gamePoints: just(0)
			})
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		assert.deepStrictEqual(actual, {
			...actual,

			teams: [
				{ teamId: 1, name: "first / second", gamePoints: 6 },
				{ teamId: 2, name: "third / fourth", gamePoints: 0 }
			]
		});
	});

	test("sets hasPreviousGameRounds to true when one of the teams has previous game rounds", function () {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 1,
				hasPreviousGameRounds: true
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 2 }),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 3,
				hasPreviousGameRounds: true
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 4 })
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		assert.deepStrictEqual(actual, {
			...actual,

			hasPreviousGameRounds: true
		});
	});

	test("sets isGameOver to false when no team reached game over game points", function () {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 1,
				gamePoints: just(14)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 2, gamePoints: just(6) }),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 3,
				gamePoints: just(14)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 4, gamePoints: just(6) })
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		assert.deepStrictEqual(actual, {
			...actual,

			isGameOver: false
		});
		assert.ok(!Object.hasOwn(actual, "winnerTeam"));
	});

	test("sets isGameOver to true when at least one team reached game over game points", function () {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 1,
				gamePoints: just(12)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 2, gamePoints: just(0) }),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 3,
				gamePoints: just(12)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 4, gamePoints: just(0) }),

			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 1,
				gamePoints: just(3)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 2, gamePoints: just(0) }),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 3,
				gamePoints: just(3)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 4, gamePoints: just(0) })
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		assert.deepStrictEqual(actual, {
			...actual,

			isGameOver: true,
			winnerTeam: {
				teamId: 1,
				name: "first",
				gamePoints: 15
			}
		});
	});

	test("sets isGameOver to true when at least one team surpassed game over game points", function () {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 1,
				gamePoints: just(16)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 2, gamePoints: just(2) }),
			currentGameRoundSessionDatabaseSelectFactory.build({
				teamId: 1,
				playerId: 3,
				gamePoints: just(16)
			}),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 4, gamePoints: just(2) })
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		assert.deepStrictEqual(actual, {
			...actual,

			isGameOver: true,
			winnerTeam: {
				teamId: 1,
				name: "first",
				gamePoints: 16
			}
		});
	});
});
