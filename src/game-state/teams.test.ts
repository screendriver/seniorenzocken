import { test, assert } from "vitest";
import { Factory } from "fishery";
import { areTeamsFilled, updateTeamGamePoint, type Team, type Teams } from "./teams";

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

test("updateTeamGamePoint() does not update anything when the team is empty", () => {
	const teams: Teams = new Map();
	const updatedTeams = updateTeamGamePoint(teams, 0, 0);

	assert.strictEqual(teams, updatedTeams);
});

test("updateTeamGamePoint() does not update the given team when the team number could not be found", () => {
	const teams: Teams = new Map([[1, teamFactory.build()]]);
	const updatedTeams = updateTeamGamePoint(teams, 42, 0);

	assert.strictEqual(teams, updatedTeams);
});

test("updateTeamGamePoint() updates the given team with the given game point when the team number could be found", () => {
	const teams: Teams = new Map([[1, teamFactory.build()]]);
	const updatedTeams = updateTeamGamePoint(teams, 1, 4);

	assert.deepStrictEqual(updatedTeams, new Map([[1, teamFactory.build({ gamePoints: 4 })]]));
});

test("updateTeamGamePoint() adds the given game point to the already existing game point", () => {
	test("updateTeamGamePoint() updates the given team when the team number could be found", () => {
		const teams: Teams = new Map([
			[
				1,
				teamFactory.build({
					gamePoints: 2
				})
			]
		]);
		const updatedTeams = updateTeamGamePoint(teams, 1, 4);

		assert.deepStrictEqual(updatedTeams, new Map([[1, teamFactory.build({ gamePoints: 6 })]]));
	});
});
