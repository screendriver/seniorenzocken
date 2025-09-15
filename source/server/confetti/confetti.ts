import type { NotPersistedTeam } from "../../shared/team.js";

export function shouldShowConfetti(team1: NotPersistedTeam, team2: NotPersistedTeam): boolean {
	return team1.currentRoundGamePoints === 4 || team2.currentRoundGamePoints === 4;
}
