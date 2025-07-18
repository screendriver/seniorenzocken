import type { NotPersistedTeam } from "../../shared/team.ts";

const pointsWhenGameIsOver = 15;

export function isGameOver(team1: NotPersistedTeam, team2: NotPersistedTeam): boolean {
	return team1.matchTotalGamePoints >= pointsWhenGameIsOver || team2.matchTotalGamePoints >= pointsWhenGameIsOver;
}
