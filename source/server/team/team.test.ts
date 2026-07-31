import assert from "node:assert";
import { suite, test } from "mocha";
import { Factory } from "fishery";
import { ok, err } from "true-myth/result";
import type { NotPersistedTeam } from "../../shared/team.js";
import { determineWinnerTeam } from "./team.js";

const notPersistedTeamFactory = Factory.define<NotPersistedTeam>(() => {
	return {
		teamNumber: 1,
		name: "",
		currentRoundGamePoints: 0,
		matchTotalGamePoints: 0,
		isStretched: false
	};
});

suite("determineWinnerTeam()", function () {
	test("returns an Err when both teams have the same match total game points", function () {
		const team1 = notPersistedTeamFactory.build({ matchTotalGamePoints: 4 });
		const team2 = notPersistedTeamFactory.build({ matchTotalGamePoints: 4 });

		const winnerTeam = determineWinnerTeam(team1, team2);

		assert.deepStrictEqual(winnerTeam, err("Both teams have the same game points"));
	});

	test("returns an Ok with the determined winner team when team 1 has won", function () {
		const loserTeam = notPersistedTeamFactory.build({ matchTotalGamePoints: 10 });
		const winnerTeam = notPersistedTeamFactory.build({ matchTotalGamePoints: 15 });

		const result = determineWinnerTeam(loserTeam, winnerTeam);

		assert.deepStrictEqual(result, ok(winnerTeam));
	});

	test("returns an Ok with the determined winner team when team 2 has won", function () {
		const winnerTeam = notPersistedTeamFactory.build({ matchTotalGamePoints: 15 });
		const loserTeam = notPersistedTeamFactory.build({ matchTotalGamePoints: 10 });

		const result = determineWinnerTeam(winnerTeam, loserTeam);

		assert.deepStrictEqual(result, ok(winnerTeam));
	});
});
