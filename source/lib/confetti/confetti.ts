import type { Teams } from "../game-store/team.js";

export function shouldShowConfetti(teams: Teams): boolean {
	return teams.some((team) => {
		return team.currentGamePoints >= 4;
	});
}
