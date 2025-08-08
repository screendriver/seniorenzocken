import type { Result } from "true-myth";
import { ok, err } from "true-myth/result";
import type { NotPersistedTeam } from "../../shared/team.js";

function teamsHaveSameGamePoints(team1: NotPersistedTeam, team2: NotPersistedTeam): boolean {
	return team1.matchTotalGamePoints === team2.matchTotalGamePoints;
}

export function determineWinnerTeam(
	team1: NotPersistedTeam,
	team2: NotPersistedTeam
): Result<NotPersistedTeam, string> {
	if (teamsHaveSameGamePoints(team1, team2)) {
		return err("Both teams have the same game points");
	}

	if (team1.matchTotalGamePoints > team2.matchTotalGamePoints) {
		return ok(team1);
	}

	return ok(team2);
}
