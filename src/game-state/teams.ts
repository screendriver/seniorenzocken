import is from "@sindresorhus/is";
import Maybe from "true-myth/maybe";
import Result from "true-myth/result";
import type { Team } from "../team/team-schema.js";

export type Teams = ReadonlyMap<number, Team>;

export function areTeamsFilled(teams: Teams): boolean {
	if (is.emptyMap(teams)) {
		return false;
	}

	return Array.from(teams.values()).every((team) => {
		return is.nonEmptyString(team.teamName);
	});
}

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
