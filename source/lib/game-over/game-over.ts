import type { Teams } from "../game-store/team.js";

const pointsWhenGameIsOver = 15;

export function checkIfGameWouldBeOver(teams: Teams): boolean {
	return teams.some((team) => {
		return team.totalGamePoints >= pointsWhenGameIsOver;
	});
}
