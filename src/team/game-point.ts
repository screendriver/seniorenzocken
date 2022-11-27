import type { TeamNumber, Teams } from "./team-schema.js";

export function updateTeamGamePoint(teams: Teams, teamNumber: TeamNumber, gamePoint: number): Teams {
	return teams.map((team, index) => {
		if (index !== teamNumber) {
			return team;
		}

		const updatedGamePoints = team.gamePoints + gamePoint;

		return {
			teamName: team.teamName,
			gamePoints: updatedGamePoints,
			isStretched: updatedGamePoints >= 12
		};
	}) as unknown as Teams;
}
