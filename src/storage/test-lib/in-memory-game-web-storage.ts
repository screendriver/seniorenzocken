import type { Team } from "../../team/team-schema.js";
import type { GameWebStorage } from "../game-web-storage.js";

export function createInMemoryGameWebStorage(): GameWebStorage {
	let localTeams: ReadonlyMap<number, Team> = new Map();

	return {
		get teams() {
			return localTeams;
		},
		set teams(teams: ReadonlyMap<number, Team>) {
			localTeams = teams;
		}
	} as unknown as GameWebStorage;
}
