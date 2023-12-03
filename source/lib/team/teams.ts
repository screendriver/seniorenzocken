import { Maybe, Result } from "true-myth";
import type { Team, Teams } from "../game-store/team.js";

function teamsHaveSameGamePoints(teams: Teams): boolean {
	return teams.every((team, currentIndex, allTeams) => {
		const nextTeam = Maybe.of(allTeams[currentIndex + 1]);

		return nextTeam.mapOr(true, (nextTeamValue) => {
			return team.totalGamePoints === nextTeamValue.totalGamePoints;
		});
	});
}

export function determineWinnerTeam(teams: Teams): Result<Team, string> {
	if (teamsHaveSameGamePoints(teams)) {
		return Result.err("Both teams have the same game points");
	}

	const winnerTeam = teams.reduce((previousTeam, currentTeam) => {
		if (previousTeam.totalGamePoints > currentTeam.totalGamePoints) {
			return previousTeam;
		}

		return currentTeam;
	});

	return Result.ok<Team, string>(winnerTeam);
}
