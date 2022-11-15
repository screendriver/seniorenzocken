import { test, assert } from "vitest";
import { Factory } from "fishery";
import Result from "true-myth/result";
import { determineWinnerTeam } from "./teams.js";
import type { Team } from "../team/team-schema.js";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0,
		isStretched: false
	};
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
