import is from "@sindresorhus/is";
import Result from "true-myth/result";
import type { Team, Teams } from "../team/team-schema.js";

export function determineWinnerTeam(teams: Teams): Result<Team, string> {
	if (is.emptyMap(teams)) {
		return Result.err<Team, string>("There are no teams set");
	}

	const winnerTeam = Array.from(teams.values()).reduce((previousTeam, currentTeam) => {
		if (previousTeam.gamePoints > currentTeam.gamePoints) {
			return previousTeam;
		}

		return currentTeam;
	});

	return Result.ok<Team, string>(winnerTeam);
}
