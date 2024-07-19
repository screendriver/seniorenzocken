import { test, expect } from "vitest";
import * as v from "valibot";

test("availableGamePoints defines 4 available game points", () => {
	expect(availableGamePoints).toStrictEqual([0, 2, 3, 4]);
});

test("gamePointsSchema parsing fails when given data is undefined", () => {
	expect(v.safeParse(gamePointsSchema, undefined).success).toBe(false);
});

test("gamePointsSchema parsing fails when given data is null", () => {
	expect(v.safeParse(gamePointsSchema, null).success).toBe(false);
});

test("gamePointsSchema parsing fails when given data is not a number", () => {
	expect(v.safeParse(gamePointsSchema, "not-a-number").success).toBe(false);
});

test("gamePointsSchema parsing fails when given data is lower than 0", () => {
	expect(v.safeParse(gamePointsSchema, -1).success).toBe(false);
});

test("gamePointsSchema parsing fails when given data is greater than 18", () => {
	expect(v.safeParse(gamePointsSchema, 19).success).toBe(false);
});

test.each([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])(
	"gamePointsSchema parsing succeeds when given data equals %i",
	(gamePoint) => {
		expect(v.safeParse(gamePointsSchema, gamePoint).success).toBe(true);
	},
);

type ReachedMaximumGamePointsTestCase = {
	team1GamePoint: Ref<GamePoint>;
	team2GamePoint: Ref<GamePoint>;
	expected: boolean;
};

test.each<ReachedMaximumGamePointsTestCase>([
	{ team1GamePoint: ref(0), team2GamePoint: ref(0), expected: false },
	{ team1GamePoint: ref(3), team2GamePoint: ref(0), expected: false },
	{ team1GamePoint: ref(0), team2GamePoint: ref(3), expected: false },
	{ team1GamePoint: ref(4), team2GamePoint: ref(0), expected: true },
	{ team1GamePoint: ref(0), team2GamePoint: ref(4), expected: true },
	{ team1GamePoint: ref(4), team2GamePoint: ref(4), expected: true },
])(
	"hasReachedMaximumGamePoint() returns $expected when team 1 has $team1GamePoint.value and team 2 has $team2GamePoint.value game points",
	({ team1GamePoint, team2GamePoint, expected }) => {
		const reached = hasReachedMaximumGamePoint(team1GamePoint, team2GamePoint);

		expect(reached).toBe(expected);
	},
);
