import { describe, it, expect } from "vitest";
import type { CurrentGameRoundSessions } from "./session-schema.js";
import { mapCurrentGameRoundSessionsFromDatabase } from "./current-game-round-session.js";

describe("mapCurrentGameRoundSessionsFromDatabase()", () => {
	it("returns an array of team names grouped by team id", () => {
		const currentGameRoundSessions: CurrentGameRoundSessions = [
			{ teamId: 1, playerNickname: "first", playerFirstName: "first-name" },
			{ teamId: 2, playerNickname: "third", playerFirstName: "third-name" },
			{ teamId: 1, playerNickname: "second", playerFirstName: "second-name" },
			{ teamId: 2, playerNickname: "fourth", playerFirstName: "fourth-name" }
		];

		const actual = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessions);

		expect(actual).toStrictEqual({
			teams: [
				{ id: 1, name: "first / second" },
				{ id: 2, name: "third / fourth" }
			],
			gamePointsPerRound: [0, 2, 3, 4],
			hasPreviousGameRounds: false
		});
	});
});
