import is from "@sindresorhus/is";
import type { Teams } from "./team-schema.js";

export function areTeamsFilled(teams: Teams): boolean {
	if (is.emptyMap(teams)) {
		return false;
	}

	return Array.from(teams.values()).every((team) => {
		return is.nonEmptyString(team.teamName);
	});
}
