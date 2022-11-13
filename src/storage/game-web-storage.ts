import Maybe from "true-myth/maybe";
import { z } from "zod";
import type { Team } from "../team/team-schema";

const teamsFromWebStorageSchema = z.array(z.tuple([z.number(), z.unknown()]));

export interface GameWebStorage {
	get teams(): ReadonlyMap<number, Team>;
	set teams(teams: ReadonlyMap<number, Team>);
}

export function createGameWebStorage(webStorage: Storage): GameWebStorage {
	const emptyTeams = new Map();

	return {
		get teams() {
			return Maybe.of(webStorage.getItem("teams")).mapOr(emptyTeams, (teamsFromWebStorage) => {
				const teamsFromWebStorageJsonParsed = teamsFromWebStorageSchema.safeParse(
					JSON.parse(teamsFromWebStorage)
				);

				if (teamsFromWebStorageJsonParsed.success) {
					return new Map(teamsFromWebStorageJsonParsed.data);
				}

				return emptyTeams;
			});
		},
		set teams(teams: ReadonlyMap<number, Team>) {
			webStorage.setItem("teams", JSON.stringify([...teams]));
		}
	};
}
