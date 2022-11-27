import is from "@sindresorhus/is";
import type { Teams } from "./team-schema.js";

export function areTeamsFilled(teams: Teams): boolean {
	return teams.every((team) => {
		return is.nonEmptyString(team.teamName);
	});
}
