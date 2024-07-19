const pointsWhenGameIsOver = 15;

export function checkIfGameWouldBeOver(teams: Teams): boolean {
	return teams.some((team) => {
		return team.value.gamePoints >= pointsWhenGameIsOver;
	});
}
