import { test, assert } from "vitest";
import { Factory } from "fishery";
import Result from "true-myth/result";
import { determineWinnerTeam, updateTeamGamePoint } from "./teams.js";
import type { Team, Teams } from "../team/team-schema.js";

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

test("determineWinnerTeam() returns a Result Err when teams store is empty", () => {
	const teams = new Map();
	const result = determineWinnerTeam(teams);

	assert.deepStrictEqual(result, Result.err("There are no teams set"));
});

test("determineWinnerTeam() returns a Result Ok when teams store is filled with just one team", () => {
	const team = teamFactory.build({
		teamName: "Team 1"
	});
	const teams = new Map([[1, team]]);

	const result = determineWinnerTeam(teams);

	assert.deepStrictEqual(result, Result.ok(team));
});

test("determineWinnerTeam() finds and returns a Result Ok with the team with the most game points", () => {
	const team1 = teamFactory.build({
		teamName: "Team 1",
		gamePoints: 8
	});
	const team2 = teamFactory.build({
		teamName: "Team 2",
		gamePoints: 15
	});
	const team3 = teamFactory.build({
		teamName: "Team 3",
		gamePoints: 10
	});
	const teams = new Map([
		[1, team1],
		[2, team2],
		[3, team3]
	]);

	const result = determineWinnerTeam(teams);

	assert.deepStrictEqual(result, Result.ok(team2));
});
