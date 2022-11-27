import { test, assert } from "vitest";
import { Factory } from "fishery";
import Result from "true-myth/result";
import { determineWinnerTeam } from "./teams.js";
import type { Team, Teams } from "../team/team-schema.js";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0,
		isStretched: false
	};
});

test("determineWinnerTeam() returns an Result Err when both teams have the same game points", () => {
	const teams: Teams = [teamFactory.build(), teamFactory.build()];

	const winnerTeamResult = determineWinnerTeam(teams);

	assert.deepStrictEqual(winnerTeamResult, Result.err("Both teams have the same game points"));
});

test("determineWinnerTeam() finds and returns a Result Ok when first team has more game points", () => {
	const winnerTeam = teamFactory.build({ gamePoints: 3 });
	const looserTeam = teamFactory.build({ gamePoints: 0 });
	const teams: Teams = [winnerTeam, looserTeam];

	const winnerTeamResult = determineWinnerTeam(teams);

	assert.deepStrictEqual(winnerTeamResult, Result.ok(winnerTeam));
});

test("determineWinnerTeam() finds and returns a Result Ok when second team has more game points", () => {
	const looserTeam = teamFactory.build({ gamePoints: 0 });
	const winnerTeam = teamFactory.build({ gamePoints: 3 });
	const teams: Teams = [looserTeam, winnerTeam];

	const winnerTeamResult = determineWinnerTeam(teams);

	assert.deepStrictEqual(winnerTeamResult, Result.ok(winnerTeam));
});
