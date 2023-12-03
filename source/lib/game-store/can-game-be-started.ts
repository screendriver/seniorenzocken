import is from "@sindresorhus/is";
import type { Teams } from "./team.js";

export function canGameBeStarted(teams: Teams): boolean {
	if (is.emptyMap(teams)) {
		return false;
	}

	return teams.every((team) => {
		return is.nonEmptyString(team.teamName);
	});
}
