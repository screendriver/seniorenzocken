import { describe, it, expect } from "vitest";
import { just, nothing } from "true-myth/maybe";
import { Factory } from "fishery";
import type { CurrentGameRoundSession } from "../../shared/current-game-round.js";
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

describe("mapCurrentGameRoundSessionsFromDatabase()", () => {
	it("returns an array of team names grouped by team id", () => {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 1, playerId: 1, playerNickname: "first" }),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 2, playerNickname: "third" }),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 1, playerId: 3, playerNickname: "second" }),
			currentGameRoundSessionDatabaseSelectFactory.build({ teamId: 2, playerId: 4, playerNickname: "fourth" })
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		expect(actual).toStrictEqual<CurrentGameRoundSession>({
			teams: [
				{ teamId: 1, name: "first / second", gamePoints: 0 },
				{ teamId: 2, name: "third / fourth", gamePoints: 0 }
			],
			gamePointsPerRound: [0, 2, 3, 4],
			hasPreviousGameRounds: false
		});
	});

	it("sums up game points per team when there is only one game round", () => {
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

		expect(actual).toMatchObject<Partial<CurrentGameRoundSession>>({
			teams: [
				{ teamId: 1, name: "first / second", gamePoints: 2 },
				{ teamId: 2, name: "third / fourth", gamePoints: 0 }
			]
		});
	});

	it("sums up game points per team when there are multiple game rounds", () => {
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

		expect(actual).toMatchObject<Partial<CurrentGameRoundSession>>({
			teams: [
				{ teamId: 1, name: "first / second", gamePoints: 6 },
				{ teamId: 2, name: "third / fourth", gamePoints: 0 }
			]
		});
	});

	it("sets hasPreviousGameRounds to true when one of the teams has previous game rounds", () => {
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

		expect(actual).toMatchObject<Partial<CurrentGameRoundSession>>({
			hasPreviousGameRounds: true
		});
	});
});
