import { suite, test, expect } from "vitest";
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

suite("determineWinnerTeam()", () => {
	test("returns an Err when both teams have the same match total game points", () => {
		const team1 = notPersistedTeamFactory.build({ matchTotalGamePoints: 4 });
		const team2 = notPersistedTeamFactory.build({ matchTotalGamePoints: 4 });

		const winnerTeam = determineWinnerTeam(team1, team2);

		expect(winnerTeam).toStrictEqual(err("Both teams have the same game points"));
	});

	test("returns an Ok with the determined winner team when team 1 has won", () => {
		const loserTeam = notPersistedTeamFactory.build({ matchTotalGamePoints: 10 });
		const winnerTeam = notPersistedTeamFactory.build({ matchTotalGamePoints: 15 });

		const result = determineWinnerTeam(loserTeam, winnerTeam);

		expect(result).toStrictEqual(ok(winnerTeam));
	});

	test("returns an Ok with the determined winner team when team 2 has won", () => {
		const winnerTeam = notPersistedTeamFactory.build({ matchTotalGamePoints: 15 });
		const loserTeam = notPersistedTeamFactory.build({ matchTotalGamePoints: 10 });

		const result = determineWinnerTeam(winnerTeam, loserTeam);

		expect(result).toStrictEqual(ok(winnerTeam));
	});
});
