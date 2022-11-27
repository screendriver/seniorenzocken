import Maybe from "true-myth/maybe";
import Result from "true-myth/result";
import type { Team, Teams } from "../team/team-schema.js";

function teamsHaveSameGamePoints(teams: Teams): boolean {
	return teams.every((team, currentIndex, allTeams) => {
		const nextTeam = Maybe.of(allTeams[currentIndex + 1]);

		return nextTeam.mapOr(true, (nextTeamValue) => {
			return team.gamePoints === nextTeamValue.gamePoints;
		});
	});
}

export function determineWinnerTeam(teams: Teams): Result<Team, string> {
	if (teamsHaveSameGamePoints(teams)) {
		return Result.err("Both teams have the same game points");
	}

	const winnerTeam = teams.reduce((previousTeam, currentTeam) => {
		if (previousTeam.gamePoints > currentTeam.gamePoints) {
			return previousTeam;
		}

		return currentTeam;
	});

	return Result.ok<Team, string>(winnerTeam);
}
