import { of, find, just, isNothing } from "true-myth/maybe";
import type { GameRound, GameRounds } from "../../shared/game-rounds.js";
import type { NotPersistedTeam } from "../../shared/team.js";

function checkForTurnAround(teamWithZeroMatchTotalGamePoints: NotPersistedTeam) {
	return (currentGameRound: GameRound) => {
		return find((gameRound) => {
			return gameRound.team.teamNumber === teamWithZeroMatchTotalGamePoints.teamNumber;
		}, currentGameRound).mapOr(false, (gameRound) => {
			return gameRound.team.matchTotalGamePoints > 0;
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

	const previousGameRoundHasAtLeastTenMatchTotalGamePoints = previousGameRound.value.some((gameRound) => {
		return gameRound.team.matchTotalGamePoints >= 10;
	});

	if (!previousGameRoundHasAtLeastTenMatchTotalGamePoints) {
		return false;
	}

	const teamWithZeroMatchTotalGamePoints = find((gameRound) => {
		return gameRound.team.matchTotalGamePoints === 0;
	}, previousGameRound.value).map((gameRound) => {
		return gameRound.team;
	});

	return just(checkForTurnAround).ap(teamWithZeroMatchTotalGamePoints).ap(currentGameRound).unwrapOr(false);
}
