import { describe, it, expect } from "vitest";
import { just, nothing } from "true-myth/maybe";
import type { CurrentGameRoundSession } from "../../shared/current-game-round.js";
import type { CurrentGameRoundSessionsDatabaseSelect } from "./session-database-schema.js";
import { mapCurrentGameRoundSessionsFromDatabase } from "./current-game-round-session.js";

describe("mapCurrentGameRoundSessionsFromDatabase()", () => {
	it("returns an array of team names grouped by team id", () => {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			{ teamId: 1, playerId: 1, playerNickname: "first", playerFirstName: "first-name", gamePoints: nothing() },
			{ teamId: 2, playerId: 2, playerNickname: "third", playerFirstName: "third-name", gamePoints: nothing() },
			{ teamId: 1, playerId: 3, playerNickname: "second", playerFirstName: "second-name", gamePoints: nothing() },
			{ teamId: 2, playerId: 4, playerNickname: "fourth", playerFirstName: "fourth-name", gamePoints: nothing() }
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		expect(actual).toStrictEqual<CurrentGameRoundSession>({
			teams: [
				{ id: 1, name: "first / second", gamePoints: 0 },
				{ id: 2, name: "third / fourth", gamePoints: 0 }
			],
			gamePointsPerRound: [0, 2, 3, 4],
			hasPreviousGameRounds: false
		});
	});

	it("sums up game points per team when there is only one game round", () => {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			{ teamId: 1, playerId: 1, playerNickname: "first", playerFirstName: "first-name", gamePoints: just(2) },
			{ teamId: 1, playerId: 2, playerNickname: "second", playerFirstName: "second-name", gamePoints: just(2) },
			{ teamId: 2, playerId: 3, playerNickname: "third", playerFirstName: "third-name", gamePoints: nothing() },
			{ teamId: 2, playerId: 4, playerNickname: "fourth", playerFirstName: "fourth-name", gamePoints: nothing() }
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		expect(actual).toStrictEqual<CurrentGameRoundSession>({
			teams: [
				{ id: 1, name: "first / second", gamePoints: 2 },
				{ id: 2, name: "third / fourth", gamePoints: 0 }
			],
			gamePointsPerRound: [0, 2, 3, 4],
			hasPreviousGameRounds: false
		});
	});

	it("sums up game points per team when there are multiple game rounds", () => {
		const currentGameRoundSessionsFromDatabase: CurrentGameRoundSessionsDatabaseSelect = [
			{ teamId: 1, playerId: 1, playerNickname: "first", playerFirstName: "first-name", gamePoints: just(2) },
			{ teamId: 1, playerId: 1, playerNickname: "first", playerFirstName: "first-name", gamePoints: just(4) },
			{ teamId: 1, playerId: 2, playerNickname: "second", playerFirstName: "second-name", gamePoints: just(2) },
			{ teamId: 1, playerId: 4, playerNickname: "second", playerFirstName: "second-name", gamePoints: just(4) },
			{ teamId: 2, playerId: 3, playerNickname: "third", playerFirstName: "third-name", gamePoints: just(0) },
			{ teamId: 2, playerId: 4, playerNickname: "fourth", playerFirstName: "fourth-name", gamePoints: just(0) }
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessionsFromDatabase);

		expect(actual).toStrictEqual<CurrentGameRoundSession>({
			teams: [
				{ id: 1, name: "first / second", gamePoints: 6 },
				{ id: 2, name: "third / fourth", gamePoints: 0 }
			],
			gamePointsPerRound: [0, 2, 3, 4],
			hasPreviousGameRounds: false
		});
	});
});
