import { ref } from "vue";
import { Factory } from "fishery";
import { test, expect } from "vitest";
import { ok as resultOk, err as resultError } from "true-myth/result";
import type { Team } from "../team";
import { determineWinnerTeam } from "../teams";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamNumber: 1,
		teamName: "",
		gamePoints: 0,
		isStretched: false,
	};
});

test("determineWinnerTeam() returns an Err when both teams have the same game points", () => {
	const team1 = ref(teamFactory.build({ gamePoints: 4 }));
	const team2 = ref(teamFactory.build({ gamePoints: 4 }));

	const winnerTeam = determineWinnerTeam(team1, team2);

	expect(winnerTeam).toStrictEqual(resultError("Both teams have the same game points"));
});

test("determineWinnerTeam() returns an Ok with the determined winner team when team 1 has won", () => {
	const loserTeam = ref(teamFactory.build({ gamePoints: 10 }));
	const winnerTeam = ref(teamFactory.build({ gamePoints: 15 }));

	const result = determineWinnerTeam(loserTeam, winnerTeam);

	expect(result).toStrictEqual(resultOk(winnerTeam));
});

test("determineWinnerTeam() returns an Ok with the determined winner team when team 2 has won", () => {
	const winnerTeam = ref(teamFactory.build({ gamePoints: 15 }));
	const loserTeam = ref(teamFactory.build({ gamePoints: 10 }));

	const result = determineWinnerTeam(winnerTeam, loserTeam);

	expect(result).toStrictEqual(resultOk(winnerTeam));
});
