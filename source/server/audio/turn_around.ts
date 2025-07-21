import { last, find, just, nothing } from "true-myth/maybe";
import type { GameRound, GameRounds } from "../../shared/game-rounds.ts";
import type { NotPersistedTeam } from "../../shared/team.ts";

type Options = {
	readonly gameRounds: GameRounds;
};

function foo(currentGameRound: GameRound) {
	return (teamWithAtLeastTenMatchTotalGamePoints: NotPersistedTeam) => {
		return (gameRoundWithZeroMatchTotalGamePoints: GameRound) => {
			return true;
		};
	};
}

export function isATurnAround(options: Options): boolean {
	const { gameRounds } = options;

	const currentGameRound = last(gameRounds).andThen((lastGameRound) => {
		return lastGameRound;
	});
	const previousGameRounds = gameRounds.toSpliced(-1);

	const teamWithAtLeastTenMatchTotalGamePoints = previousGameRounds.reduce<Maybe<NotPersistedTeam>>(
		(_, gameRound) => {
			const team1 = gameRound[0];
			const team2 = gameRound[1];
			if (team1.matchTotalGamePoints >= 10) {
				return just(team1);
			}

			if (team2.matchTotalGamePoints >= 10) {
				return just(team2);
			}

			return nothing();
		},
		nothing(),
	);
	const gameRoundWithZeroMatchTotalGamePoints = find((teams) => {
		return teams[0].matchTotalGamePoints === 0 || teams[1].matchTotalGamePoints === 0;
	}, previousGameRounds);

	return just(foo)
		.ap(currentGameRound)
		.ap(teamWithAtLeastTenMatchTotalGamePoints)
		.ap(gameRoundWithZeroMatchTotalGamePoints)
		.unwrapOr(false);
}
