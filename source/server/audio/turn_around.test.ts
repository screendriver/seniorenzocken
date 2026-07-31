import assert from "node:assert";
import { suite, test } from "mocha";
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

suite("isTurnAround()", function () {
	test("returns false for no game rounds", function () {
		const actualTurnAround = createTurnAround([]);

		assert.strictEqual(actualTurnAround, false);
	});

	test("returns false for only one game round", function () {
		const actualTurnAround = createTurnAround([createGameRound(0, 0)]);

		assert.strictEqual(actualTurnAround, false);
	});

	test("returns false when the previous score difference is less than 6 even if the trailing team scores", function () {
		const actualTurnAround = createTurnAround([createGameRound(10, 5), createGameRound(10, 7)]);

		assert.strictEqual(actualTurnAround, false);
	});

	test("returns true when team 1 led by exactly 6 and team 2 then scores 2", function () {
		const actualTurnAround = createTurnAround([createGameRound(10, 4), createGameRound(10, 6)]);

		assert.strictEqual(actualTurnAround, true);
	});

	test("returns true when team 1 led by more than 6 and team 2 then scores at least 2", function () {
		const actualTurnAround = createTurnAround([createGameRound(11, 3), createGameRound(11, 6)]);

		assert.strictEqual(actualTurnAround, true);
	});

	test("returns true when team 2 led by exactly 6 and team 1 then scores 2", function () {
		const actualTurnAround = createTurnAround([createGameRound(4, 10), createGameRound(6, 10)]);

		assert.strictEqual(actualTurnAround, true);
	});

	test("returns true when team 2 led by more than 6 and team 1 then scores at least 2", function () {
		const actualTurnAround = createTurnAround([createGameRound(3, 11), createGameRound(6, 11)]);

		assert.strictEqual(actualTurnAround, true);
	});

	test("returns false when the team that was already leading scores and the trailing team does not", function () {
		const actualTurnAround = createTurnAround([createGameRound(10, 4), createGameRound(12, 4)]);

		assert.strictEqual(actualTurnAround, false);
	});

	test("returns false when the previous trailing team does not increase its score", function () {
		const actualTurnAround = createTurnAround([createGameRound(10, 4), createGameRound(10, 4)]);

		assert.strictEqual(actualTurnAround, false);
	});

	test("returns true even when the trailing team already had points before", function () {
		const actualTurnAround = createTurnAround([createGameRound(10, 4), createGameRound(10, 6)]);

		assert.strictEqual(actualTurnAround, true);
	});

	test("returns true repeatedly when consecutive rounds satisfy the rule", function () {
		const firstActualTurnAround = createTurnAround([createGameRound(12, 4), createGameRound(12, 6)]);
		const secondActualTurnAround = createTurnAround([
			createGameRound(12, 4),
			createGameRound(12, 6),
			createGameRound(12, 8)
		]);

		assert.strictEqual(firstActualTurnAround, true);
		assert.strictEqual(secondActualTurnAround, true);
	});

	test("returns false when game rounds are in reversed chronological order and the previously trailing team did not actually gain points", function () {
		const actualTurnAround = createTurnAround([createGameRound(10, 8), createGameRound(10, 6)]);

		assert.strictEqual(actualTurnAround, false);
	});
});
