import type { Result } from "true-myth";
import { ok, err } from "true-myth/result";
import type { Ref } from "vue";
import type { NotPersistedTeam } from "../../shared/team.ts";

function teamsHaveSameGamePoints(team1: Ref<NotPersistedTeam>, team2: Ref<NotPersistedTeam>): boolean {
	return team1.value.matchTotalGamePoints === team2.value.matchTotalGamePoints;
}

export function determineWinnerTeam(
	team1: Ref<NotPersistedTeam>,
	team2: Ref<NotPersistedTeam>,
): Result<Ref<NotPersistedTeam>, string> {
	if (teamsHaveSameGamePoints(team1, team2)) {
		return err("Both teams have the same game points");
	}

	if (team1.value.matchTotalGamePoints > team2.value.matchTotalGamePoints) {
		return ok(team1);
	}

	return ok(team2);
}
