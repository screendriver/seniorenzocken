import { describe, it, expect } from "vitest";
import type { CurrentGameRoundSessions } from "./session-schema.js";
import { mapCurrentGameRoundSessionsFromDatabase } from "./current-game-round-session.js";

describe("mapCurrentGameRoundSessionsFromDatabase()", () => {
	it("returns an array of team names grouped by team id", () => {
		const currentGameRoundSessions: CurrentGameRoundSessions = [
			{ playerNickname: "first", playerFirstName: "first-name", teamId: 1 },
			{ playerNickname: "third", playerFirstName: "third-name", teamId: 2 },
			{ playerNickname: "second", playerFirstName: "second-name", teamId: 1 },
			{ playerNickname: "fourth", playerFirstName: "fourth-name", teamId: 2 }
		];

		const teamNames = mapCurrentGameRoundSessionsFromDatabase(currentGameRoundSessions);

		expect(teamNames).toStrictEqual({ teamNames: ["first / second", "third / fourth"] });
	});
});
