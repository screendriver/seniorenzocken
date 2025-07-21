import { of, find, just, isNothing } from "true-myth/maybe";
import type { GameRound, GameRounds } from "../../shared/game-rounds.ts";
import type { NotPersistedTeam } from "../../shared/team.ts";

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
	const lastTwoGameRounds = gameRounds.slice(-2);
	const previousGameRound = of(lastTwoGameRounds[0]);
	const currentGameRound = of(lastTwoGameRounds[1]);

	if (isNothing(previousGameRound) || isNothing(currentGameRound)) {
		return false;
	}

	const teamWithAtLeastTenMatchTotalGamePoints = find(
		(team) => team.matchTotalGamePoints >= 10,
		previousGameRound.value,
	);

	return teamWithAtLeastTenMatchTotalGamePoints.match({
		Nothing() {
			return false;
		},
		Just() {
			const teamWithZeroMatchTotalGamePoints = find(
				(team) => team.matchTotalGamePoints === 0,
				previousGameRound.value,
			);

			return just(checkforTurnAround).ap(teamWithZeroMatchTotalGamePoints).ap(currentGameRound).unwrapOr(false);
		},
	});
}
