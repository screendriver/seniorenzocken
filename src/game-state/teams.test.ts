import { test, assert } from "vitest";
import { Factory } from "fishery";
import { areTeamsFilled, type Team } from "./teams";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0
	};
});

test("areTeamsFilled() returns false when teams are an empty Map", () => {
	const filled = areTeamsFilled(new Map());

	assert.isFalse(filled);
});

test('areTeamsFilled() returns false when teams Map has one item with an empty "teamName"', () => {
	const teams = new Map([[1, teamFactory.build()]]);

	const filled = areTeamsFilled(teams);

	assert.isFalse(filled);
});

test('areTeamsFilled() returns false when teams Map has two items with an empty "teamName"', () => {
	const teams = new Map([
		[1, teamFactory.build()],
		[2, teamFactory.build()]
	]);

	const filled = areTeamsFilled(teams);

	assert.isFalse(filled);
});

test('areTeamsFilled() returns true when teams Map has one item with a non empty "teamName"', () => {
	const teams = new Map([[1, teamFactory.build({ teamName: "test" })]]);

	const filled = areTeamsFilled(teams);

	assert.isTrue(filled);
});

test('areTeamsFilled() returns true when teams Map has two items with a non empty "teamName"', () => {
	const teams = new Map([
		[1, teamFactory.build({ teamName: "test" })],
		[1, teamFactory.build({ teamName: "test2" })]
	]);

	const filled = areTeamsFilled(teams);

	assert.isTrue(filled);
});

test('areTeamsFilled() returns false when teams Map has two items where one item has a non empty "teamName"', () => {
	const teams = new Map([
		[1, teamFactory.build({ teamName: "test" })],
		[1, teamFactory.build()]
	]);

	const filled = areTeamsFilled(teams);

	assert.isFalse(filled);
});
