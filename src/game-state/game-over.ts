import type { Teams } from "./teams";

export function checkIfGameWouldBeOver(teams: Teams, teamNumber: number, gamePoints: number): boolean {
	for (const [currentTeamNumber, team] of teams.entries()) {
		if (currentTeamNumber !== teamNumber) {
			continue;
		}

		if (team.gamePoints + gamePoints >= 15) {
			return true;
		}
	}

	return false;
}
