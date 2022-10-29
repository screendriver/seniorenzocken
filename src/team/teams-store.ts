import { derived, get, type Writable } from "svelte/store";
import is from "@sindresorhus/is";
import Maybe from "true-myth/maybe";
import Result from "true-myth/result";
import { createTeamsStore, type Team, type Teams } from "./teams-store-factory";

export type { Team, Teams } from "./teams-store-factory";

export const teams = createTeamsStore(window.sessionStorage);

export const areTeamsFilled = derived(teams, ($teamsStore) => {
	if (is.emptyMap($teamsStore)) {
		return false;
	}

	return Array.from($teamsStore.values()).every((team) => {
		return is.nonEmptyString(team.teamName);
	});
});

export function updateStoreTeamGamePoints(teamNumber: number, gamePoint: number, teamsStore: Writable<Teams>): Teams {
	teamsStore.update((teamsMap) => {
		const team = Maybe.of(teamsMap.get(teamNumber));

		if (team.isNothing) {
			return teamsMap;
		}

		const updatedTeams = new Map(teamsMap);

		updatedTeams.set(teamNumber, {
			teamName: team.value.teamName,
			gamePoints: team.value.gamePoints + gamePoint
		});

		return updatedTeams;
	});

	return get(teamsStore);
}

export const winnerTeam = derived(teams, ($teamsStore) => {
	if (is.emptyMap($teamsStore)) {
		return Result.err<Team, string>("There are no teams set");
	}

	const winnerTeam = Array.from($teamsStore.values()).reduce((previousTeam, currentTeam) => {
		if (previousTeam.gamePoints > currentTeam.gamePoints) {
			return previousTeam;
		}

		return currentTeam;
	});

	return Result.ok<Team, string>(winnerTeam);
});
