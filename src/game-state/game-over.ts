import type { Teams } from "../team/team-schema.js";

const pointsWhenGameIsOver = 15;

export function checkIfGameWouldBeOver(teams: Teams, teamNumber: number, gamePoints: number): boolean {
	for (const [currentTeamNumber, team] of teams.entries()) {
		if (currentTeamNumber !== teamNumber) {
			continue;
		}

		if (team.gamePoints + gamePoints >= pointsWhenGameIsOver) {
			return true;
		}
	}

	return false;
}
