import type { Result } from "true-myth";
import { ok as resultOk, err as resultError } from "true-myth/result";
import type { Ref } from "vue";
import type { Team } from "./team";

function teamsHaveSameGamePoints(team1: Ref<Team>, team2: Ref<Team>): boolean {
	return team1.value.gamePoints === team2.value.gamePoints;
}

export function determineWinnerTeam(team1: Ref<Team>, team2: Ref<Team>): Result<Ref<Team>, string> {
	if (teamsHaveSameGamePoints(team1, team2)) {
		return resultError("Both teams have the same game points");
	}

	if (team1.value.gamePoints > team2.value.gamePoints) {
		return resultOk(team1);
	}

	return resultOk(team2);
}
