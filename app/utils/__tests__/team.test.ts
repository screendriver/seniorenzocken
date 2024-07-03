import { test, expect } from "vitest";
import { Factory } from "fishery";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamNumber: 1,
		teamName: "",
		gamePoints: 0,
		isStretched: false,
	};
});

test("createInitialTeam() returns a newly created team with team number 1", () => {
	const actual = createInitialTeam(1);
	const expected = teamFactory.build({ teamNumber: 1 });

	expect(actual).toStrictEqual(expected);
});

test("createInitialTeam() returns a newly created team with team number 2", () => {
	const actual = createInitialTeam(2);
	const expected = teamFactory.build({ teamNumber: 2 });

	expect(actual).toStrictEqual(expected);
});
