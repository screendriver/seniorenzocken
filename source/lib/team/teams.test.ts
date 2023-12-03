import test from "ava";
import { Result } from "true-myth";
import { determineWinnerTeam } from "./teams.js";
import type { Teams } from "../game-store/team.js";
import { teamFactory } from "../../../test/team-factory.js";

const determineWinnerTeamResultErrMacro = test.macro((t, teams: Teams) => {
	const actual = determineWinnerTeam(teams);
	const expected = Result.err("Both teams have the same game points");

	t.deepEqual(actual, expected);
});

test(
	"determineWinnerTeam() returns a Result Err when given teams has the same total game points",
	determineWinnerTeamResultErrMacro,
	[teamFactory.build({ totalGamePoints: 15 }), teamFactory.build({ totalGamePoints: 15 })],
);

test("determineWinnerTeam() returns a Result Ok with the determined winner team", (t) => {
	const loserTeam = teamFactory.build({ totalGamePoints: 10 });
	const winnerTeam = teamFactory.build({ totalGamePoints: 15 });
	const teams: Teams = [loserTeam, winnerTeam];

	const actual = determineWinnerTeam(teams);
	const expected = Result.ok(winnerTeam);

	t.deepEqual(actual, expected);
});
