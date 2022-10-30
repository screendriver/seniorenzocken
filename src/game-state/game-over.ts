import type { Teams } from "./teams";

export function checkIfGameWouldBeOver(teams: Teams, gamePoints: number): boolean {
	for (const team of teams.values()) {
		if (team.gamePoints + gamePoints >= 15) {
			return true;
		}
	}

	return false;
}
