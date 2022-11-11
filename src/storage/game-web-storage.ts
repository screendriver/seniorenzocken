import type { Team } from "../game-state/teams.js";

export interface GameWebStorage {
	setTeams(teams: ReadonlyMap<number, Team>): void;
}

export function createGameWebStorage(webStorage: Storage): GameWebStorage {
	return {
		setTeams(teams) {
			const teamsRecord = Object.fromEntries(teams);

			webStorage.setItem("teams", JSON.stringify(teamsRecord));
		}
	};
}
