import { suite, test, expect } from "vitest";
import { Factory } from "fishery";
import { NotPersistedTeam } from "../../shared/team.ts";
import { isTurnAround } from "./turn_around.ts";

const notPersistedTeamFactory = Factory.define<NotPersistedTeam>(() => {
	return {
		teamNumber: 1,
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
				[notPersistedTeamFactory.build({ teamNumber: 1 }), notPersistedTeamFactory.build({ teamNumber: 2 })],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns false when given game rounds has just one game round and one team has 10 match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 10 }),
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns false when given game rounds has just one game round and one team has more than 10 match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 11 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns false when given game rounds has not reached 10 match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 2 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 6 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 9 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 9 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 2 }),
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns true when team 1 has reached 10 match total game points and team 2 made its first match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 2 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 6 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 10 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 10 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 2 }),
				],
			],
		});

		expect(turnAround).toBe(true);
	});

	test("returns true when team 1 has reached more than 10 match total game points and team 2 made its first match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 2 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 6 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 10 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 11 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 2 }),
				],
			],
		});

		expect(turnAround).toBe(true);
	});

	test("returns false when team 1 has reached more than 10 match total game points and team 2 made more than once new match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 2 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 6 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 10 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 11 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 11 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 5 }),
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns true when team 2 has reached 10 match total game points and team 1 made its first match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 6 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 10 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 2 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 10 }),
				],
			],
		});

		expect(turnAround).toBe(true);
	});

	test("returns true when team 2 has reached more than 10 match total game points and team 1 made its first match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 6 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 10 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 2 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 11 }),
				],
			],
		});

		expect(turnAround).toBe(true);
	});

	test("returns false when team 2 has reached more than 10 match total game points and team 1 made more than once match total game points", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 6 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 10 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 2 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 11 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 4 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 11 }),
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns false when team 1 has reached 10 match total game points and team 1 made its first match total game points but the order of game rounds is reversed", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 10 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 10 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 6 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 2 }),
					notPersistedTeamFactory.build({ teamNumber: 2 }),
				],
			],
		});

		expect(turnAround).toBe(false);
	});

	test("returns false when team 2 has reached 10 match total game points and team 1 made its first match total game points but the order of game rounds is reversed", () => {
		const turnAround = isTurnAround({
			gameRounds: [
				[
					notPersistedTeamFactory.build({ teamNumber: 1, matchTotalGamePoints: 2 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 10 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 10 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 6 }),
				],
				[
					notPersistedTeamFactory.build({ teamNumber: 1 }),
					notPersistedTeamFactory.build({ teamNumber: 2, matchTotalGamePoints: 2 }),
				],
			],
		});

		expect(turnAround).toBe(false);
	});
});
