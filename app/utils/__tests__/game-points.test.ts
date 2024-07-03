import { test, expect } from "vitest";

test("availableGamePoints defines 4 available game points", () => {
	expect(availableGamePoints).toStrictEqual([0, 2, 3, 4]);
});

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
	"hasReachedMaximumGamePoints() returns $expected when team 1 has $team1GamePoint.value and team 2 has $team2GamePoint.value game points",
	({ team1GamePoint, team2GamePoint, expected }) => {
		const reached = hasReachedMaximumGamePoints(team1GamePoint, team2GamePoint);

		expect(reached).toBe(expected);
	},
);
