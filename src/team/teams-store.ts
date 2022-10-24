import { derived } from "svelte/store";
import is from "@sindresorhus/is";
import { createTeamsStore } from "./teams-store-factory";

export type { Team } from "./teams-store-factory";

export const teams = createTeamsStore(window.sessionStorage);

export const areTeamsFilled = derived(teams, ($teamsStore) => {
	if (is.emptyMap($teamsStore)) {
		return false;
	}

	return Array.from($teamsStore.values()).every((team) => {
		return is.nonEmptyString(team.teamName);
	});
});
