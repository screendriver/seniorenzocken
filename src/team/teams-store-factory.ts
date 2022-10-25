import { writable, type Writable } from "svelte/store";
import { z } from "zod";
import { Maybe } from "true-myth/maybe";

const teamSchema = z
	.object({
		teamName: z.string(),
		gamePoints: z.number().nonnegative()
	})
	.strict();

const allTeamsSchema = z.array(z.tuple([z.number(), teamSchema]));

export type Team = z.infer<typeof teamSchema>;

const storageKey = "teams";

function mapTeamsFromStorageToTeamMap(teamsFromStorage: string): Map<number, Team> {
	const emptyMap = new Map<number, Team>();

	try {
		const parseResult = allTeamsSchema.parse(JSON.parse(teamsFromStorage));

		return new Map(parseResult);
	} catch {
		return emptyMap;
	}
}

export function createTeamsStore(storage: Storage): Writable<Map<number, Team>> {
	const initialStoreValue = Maybe.of(storage.getItem(storageKey)).mapOr(
		new Map<number, Team>(),
		mapTeamsFromStorageToTeamMap
	);

	const { set, subscribe, update } = writable(initialStoreValue);

	subscribe((teams) => {
		const teamsWithoutMaybes = Array.from(teams.entries()).map(([teamNumber, team]) => {
			const mappedTeam = {
				teamName: team.teamName,
				gamePoints: team.gamePoints
			};

			return [teamNumber, mappedTeam];
		});
		const teamsAsString = JSON.stringify(teamsWithoutMaybes);

		storage.setItem(storageKey, teamsAsString);
	});

	return {
		set,
		subscribe,
		update
	};
}
