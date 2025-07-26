import { suite, test, expect } from "vitest";
import { Factory } from "fishery";
import type { NotPersistedTeam1, NotPersistedTeam2 } from "../../shared/team.js";
import { isTurnAround } from "./turn_around.js";

const notPersistedTeam1Factory = Factory.define<NotPersistedTeam1>(() => {
	return {
		teamNumber: 1,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false,
	};
});

const notPersistedTeam2Factory = Factory.define<NotPersistedTeam2>(() => {
	return {
		teamNumber: 2,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false,
	};
});

suite("isTurnAround()", () => {
	test("returns false when given game rounds are empty", () => {
		const turnAround = isTurnAround({ gameRounds: [] });

		expect(turnAround).toBe(false);
	});

	test("returns false when given game rounds has just one game round", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns false when given game rounds has just one game round and one team has 10 match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns false when given game rounds has just one game round and one team has more than 10 match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 11 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns false when given game rounds has not reached 10 match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{
						team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 6 }),
						hasWonGameRound: false,
					},
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{
						team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 9 }),
						hasWonGameRound: false,
					},
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{
						team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 9 }),
						hasWonGameRound: false,
					},
					{
						team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 2 }),
						hasWonGameRound: false,
					},
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns true when team 1 has reached 10 match total game points and team 2 made its first match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 6 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(true);
	});

	test("returns true when team 1 has reached more than 10 match total game points and team 2 made its first match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 6 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 11 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(true);
	});

	test("returns false when team 1 has reached more than 10 match total game points and team 2 made more than once new match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 6 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 11 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 11 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 5 }), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns true when team 2 has reached 10 match total game points and team 1 made its first match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 6 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(true);
	});

	test("returns true when team 2 has reached more than 10 match total game points and team 1 made its first match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 6 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 11 }), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(true);
	});

	test("returns false when team 2 has reached more than 10 match total game points and team 1 made more than once match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 6 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 11 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 4 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 11 }), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns false when team 1 has reached 10 match total game points and team 1 made its first match total game points but the order of game rounds is reversed", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 6 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build(), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns false when team 2 has reached 10 match total game points and team 1 made its first match total game points but the order of game rounds is reversed", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					{ team: notPersistedTeam1Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 10 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 6 }), hasWonGameRound: false },
				],
				[
					{ team: notPersistedTeam1Factory.build(), hasWonGameRound: false },
					{ team: notPersistedTeam2Factory.build({ matchTotalGamePoints: 2 }), hasWonGameRound: false },
				],
			],
		});

		expect(turnAround).toBe(false);
	});
});
