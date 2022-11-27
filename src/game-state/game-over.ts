import type { Teams } from "../team/team-schema.js";

const pointsWhenGameIsOver = 15;

export function checkIfGameWouldBeOver(teams: Teams): boolean {
	return teams.some((team) => {
		return team.gamePoints >= pointsWhenGameIsOver;
	});
}
