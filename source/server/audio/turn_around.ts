import { last, find, just } from "true-myth/maybe";
import type { GameRound, GameRounds } from "../../shared/game-rounds.ts";
import type { NotPersistedTeam } from "../../shared/team.ts";

function hasAtLeastTenMatchTotalGamePoints(gameRound: GameRound): boolean {
	const [team1, team2] = gameRound;

	return team1.matchTotalGamePoints >= 10 || team2.matchTotalGamePoints >= 10;
}

function hasZeroMatchTotalGamePoints(gameRound: GameRound): boolean {
	const [team1, team2] = gameRound;

	return team1.matchTotalGamePoints === 0 || team2.matchTotalGamePoints === 0;
}

function checkforTurnAround(teamWithZeroMatchTotalGamePoints: NotPersistedTeam) {
	return (currentGameRound: GameRound) => {
		return find((team) => {
			return team.teamNumber === teamWithZeroMatchTotalGamePoints.teamNumber;
		}, currentGameRound).mapOr(false, (foundTeam) => {
			return foundTeam.matchTotalGamePoints > 0;
		});
	};
}

type Options = {
	readonly gameRounds: GameRounds;
};

export function isTurnAround(options: Options): boolean {
	const { gameRounds } = options;
	const previousGameRounds = gameRounds.toSpliced(-1);
	const teamWithAtLeastTenMatchTotalGamePoints = find(hasAtLeastTenMatchTotalGamePoints, previousGameRounds);

	return teamWithAtLeastTenMatchTotalGamePoints.match({
		Nothing() {
			return false;
		},
		Just() {
			const teamWithZeroMatchTotalGamePoints = find(hasZeroMatchTotalGamePoints, previousGameRounds).map(
				(gameRound) => {
					const [team1, team2] = gameRound;

					return team1.matchTotalGamePoints === 0 ? team1 : team2;
				},
			);
			const currentGameRound = last(gameRounds).andThen((lastGameRound) => lastGameRound);

			return just(checkforTurnAround).ap(teamWithZeroMatchTotalGamePoints).ap(currentGameRound).unwrapOr(false);
		},
	});
}
