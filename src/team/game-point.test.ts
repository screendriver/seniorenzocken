import { Factory } from "fishery";
import { test, assert } from "vitest";
import { updateTeamGamePoint } from "./game-point.js";
import type { Team, Teams } from "./team-schema.js";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0,
		isStretched: false
	};
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

test('updateTeamGamePoint() sets "isStretched" to true when team has reached 12 game points', () => {
	const teams: Teams = new Map([[1, teamFactory.build()]]);
	const updatedTeams = updateTeamGamePoint(teams, 1, 12);

	assert.deepStrictEqual(updatedTeams, new Map([[1, teamFactory.build({ gamePoints: 12, isStretched: true })]]));
});

test('updateTeamGamePoint() sets "isStretched" to true when team has reached more than 12 game points', () => {
	const teams: Teams = new Map([[1, teamFactory.build()]]);
	const updatedTeams = updateTeamGamePoint(teams, 1, 13);

	assert.deepStrictEqual(updatedTeams, new Map([[1, teamFactory.build({ gamePoints: 13, isStretched: true })]]));
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
