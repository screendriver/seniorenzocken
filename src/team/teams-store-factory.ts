import { writable, type Writable } from "svelte/store";
import { z } from "zod";
import { Maybe } from "true-myth/maybe";

const teamSchema = z
	.object({
		teamName: z.string(),
		teamNumber: z.number().nonnegative()
	})
	.strict();

const allTeamsSchema = z.array(z.tuple([z.number(), teamSchema]));

export type Team = z.infer<typeof teamSchema>;

const storageKey = "teams";

function mapTeamFromStorageToTeamMap(teamFromStorage: string): Map<number, Team> {
	const emptyMap = new Map<number, Team>();

	try {
		const parseResult = allTeamsSchema.parse(JSON.parse(teamFromStorage));

		return new Map(parseResult);
	} catch {
		return emptyMap;
	}
}

export function createTeamsStore(storage: Storage): Writable<Map<number, Team>> {
	const initialStoreValue = Maybe.of(storage.getItem(storageKey)).mapOr(
		new Map<number, Team>(),
		mapTeamFromStorageToTeamMap
	);

	const { set, subscribe, update } = writable(initialStoreValue);

	subscribe((teams) => {
		const teamsAsString = JSON.stringify(Array.from(teams.entries()));

		storage.setItem(storageKey, teamsAsString);
	});

	return {
		set,
		subscribe,
		update
	};
}
