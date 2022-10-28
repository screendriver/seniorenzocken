import type Maybe from "true-myth/maybe";
import type { Teams } from "../team/teams-store";

export function checkIfGameIsOver(teams: Maybe<Teams>): boolean {
	return teams.mapOr(false, (teamsMap) => {
		for (const team of teamsMap.values()) {
			if (team.gamePoints >= 15) {
				return true;
			}
		}

		return false;
	});
}
