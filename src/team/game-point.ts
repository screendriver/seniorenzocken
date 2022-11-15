import Maybe from "true-myth/maybe";
import type { Teams } from "./team-schema.js";

export function updateTeamGamePoint(teams: Teams, teamNumber: number, gamePoint: number): Teams {
	const foundTeam = Maybe.of(teams.get(teamNumber));

	if (foundTeam.isNothing) {
		return teams;
	}

	const newGamePoints = foundTeam.value.gamePoints + gamePoint;
	const updatedTeams = new Map(teams);

	updatedTeams.set(teamNumber, {
		teamName: foundTeam.value.teamName,
		gamePoints: newGamePoints,
		isStretched: newGamePoints >= 12
	});

	return updatedTeams;
}
