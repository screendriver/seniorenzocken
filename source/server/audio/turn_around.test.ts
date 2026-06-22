import { describe, it, expect } from "vitest";
import { Factory } from "fishery";
import type { GameRound, GameRounds } from "../../shared/game-rounds.js";
import type { MatchTotalGamePoints } from "../../shared/game-points.js";
import type { NotPersistedTeam1, NotPersistedTeam2 } from "../../shared/team.js";
import { isTurnAround } from "./turn_around.js";

const notPersistedTeam1Factory = Factory.define<NotPersistedTeam1>(() => {
	return {
		teamNumber: 1,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false
	};
});

const notPersistedTeam2Factory = Factory.define<NotPersistedTeam2>(() => {
	return {
		teamNumber: 2,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false
	};
});

function createGameRound(
	team1MatchTotalGamePoints: MatchTotalGamePoints,
	team2MatchTotalGamePoints: MatchTotalGamePoints
): GameRound {
	return [
		{
			team: notPersistedTeam1Factory.build({ matchTotalGamePoints: team1MatchTotalGamePoints }),
			hasWonGameRound: false
		},
		{
			team: notPersistedTeam2Factory.build({ matchTotalGamePoints: team2MatchTotalGamePoints }),
			hasWonGameRound: false
		}
	];
}

function createTurnAround(gameRounds: GameRounds): boolean {
	return isTurnAround({ gameRounds });
}

describe("isTurnAround()", () => {
	it("returns false for no game rounds", () => {
		const actualTurnAround = createTurnAround([]);

		expect(actualTurnAround).toBe(false);
	});

	it("returns false for only one game round", () => {
		const actualTurnAround = createTurnAround([createGameRound(0, 0)]);

		expect(actualTurnAround).toBe(false);
	});

	it("returns false when the previous score difference is less than 6 even if the trailing team scores", () => {
		const actualTurnAround = createTurnAround([createGameRound(10, 5), createGameRound(10, 7)]);

		expect(actualTurnAround).toBe(false);
	});

	it("returns true when team 1 led by exactly 6 and team 2 then scores 2", () => {
		const actualTurnAround = createTurnAround([createGameRound(10, 4), createGameRound(10, 6)]);

		expect(actualTurnAround).toBe(true);
	});

	it("returns true when team 1 led by more than 6 and team 2 then scores at least 2", () => {
		const actualTurnAround = createTurnAround([createGameRound(11, 3), createGameRound(11, 6)]);

		expect(actualTurnAround).toBe(true);
	});

	it("returns true when team 2 led by exactly 6 and team 1 then scores 2", () => {
		const actualTurnAround = createTurnAround([createGameRound(4, 10), createGameRound(6, 10)]);

		expect(actualTurnAround).toBe(true);
	});

	it("returns true when team 2 led by more than 6 and team 1 then scores at least 2", () => {
		const actualTurnAround = createTurnAround([createGameRound(3, 11), createGameRound(6, 11)]);

		expect(actualTurnAround).toBe(true);
	});

	it("returns false when the team that was already leading scores and the trailing team does not", () => {
		const actualTurnAround = createTurnAround([createGameRound(10, 4), createGameRound(12, 4)]);

		expect(actualTurnAround).toBe(false);
	});

	it("returns false when the previous trailing team does not increase its score", () => {
		const actualTurnAround = createTurnAround([createGameRound(10, 4), createGameRound(10, 4)]);

		expect(actualTurnAround).toBe(false);
	});

	it("returns true even when the trailing team already had points before", () => {
		const actualTurnAround = createTurnAround([createGameRound(10, 4), createGameRound(10, 6)]);

		expect(actualTurnAround).toBe(true);
	});

	it("returns true repeatedly when consecutive rounds satisfy the rule", () => {
		const firstActualTurnAround = createTurnAround([createGameRound(12, 4), createGameRound(12, 6)]);
		const secondActualTurnAround = createTurnAround([
			createGameRound(12, 4),
			createGameRound(12, 6),
			createGameRound(12, 8)
		]);

		expect(firstActualTurnAround).toBe(true);
		expect(secondActualTurnAround).toBe(true);
	});

	it("returns false when game rounds are in reversed chronological order and the previously trailing team did not actually gain points", () => {
		const actualTurnAround = createTurnAround([createGameRound(10, 8), createGameRound(10, 6)]);

		expect(actualTurnAround).toBe(false);
	});
});
