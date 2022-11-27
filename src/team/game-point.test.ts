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

test("updateTeamGamePoint() updates team 0 with the given game point", () => {
	const teams: Teams = [teamFactory.build(), teamFactory.build()];
	const updatedTeams = updateTeamGamePoint(teams, 0, 4);

	assert.deepStrictEqual(updatedTeams, [teamFactory.build({ gamePoints: 4 }), teamFactory.build()]);
});

test("updateTeamGamePoint() updates team 1 with the given game point", () => {
	const teams: Teams = [teamFactory.build(), teamFactory.build()];
	const updatedTeams = updateTeamGamePoint(teams, 1, 4);

	assert.deepStrictEqual(updatedTeams, [teamFactory.build(), teamFactory.build({ gamePoints: 4 })]);
});

test('updateTeamGamePoint() sets "isStretched" to true when team has reached 12 game points', () => {
	const teams: Teams = [teamFactory.build(), teamFactory.build()];
	const updatedTeams = updateTeamGamePoint(teams, 0, 12);

	assert.deepStrictEqual(updatedTeams, [
		teamFactory.build({
			gamePoints: 12,
			isStretched: true
		}),
		teamFactory.build()
	]);
});

test('updateTeamGamePoint() sets "isStretched" to true when team has reached more than 12 game points', () => {
	const teams: Teams = [teamFactory.build(), teamFactory.build()];
	const updatedTeams = updateTeamGamePoint(teams, 0, 13);

	assert.deepStrictEqual(updatedTeams, [
		teamFactory.build({
			gamePoints: 13,
			isStretched: true
		}),
		teamFactory.build()
	]);
});

test("updateTeamGamePoint() adds the given game point to the already existing game point", () => {
	const teams: Teams = [teamFactory.build(), teamFactory.build({ gamePoints: 2 })];
	const updatedTeams = updateTeamGamePoint(teams, 1, 4);

	assert.deepStrictEqual(updatedTeams, [
		teamFactory.build(),
		teamFactory.build({
			gamePoints: 6
		})
	]);
});
