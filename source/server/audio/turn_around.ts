import { of, just, nothing, type Maybe } from "true-myth/maybe";
import type { GameRound, GameRounds } from "../../shared/game-rounds.js";

const minimumMatchTotalGamePointDifference = 6;
const minimumTrailingTeamScoredGamePoints = 2;

type TeamNumber = 1 | 2;

type TeamMatchTotalGamePoints = {
	readonly teamNumber: TeamNumber;
	readonly matchTotalGamePoints: number;
};

type PreviousRoundScoreComparison = {
	readonly previousTrailingTeam: TeamMatchTotalGamePoints;
	readonly previousLeadingTeam: TeamMatchTotalGamePoints;
};

type Options = {
	readonly gameRounds: GameRounds;
};

function getLastTwoGameRounds(gameRounds: GameRounds): Maybe<readonly [GameRound, GameRound]> {
	const previousGameRound = of(gameRounds.at(-2));
	const currentGameRound = of(gameRounds.at(-1));

	return previousGameRound.andThen((previousGameRoundValue) => {
		return currentGameRound.map((currentGameRoundValue) => {
			return [previousGameRoundValue, currentGameRoundValue] as const;
		});
	});
}

function getTeamMatchTotalGamePoints(gameRound: GameRound, teamNumber: TeamNumber): TeamMatchTotalGamePoints {
	const teamGameRound = teamNumber === 1 ? gameRound[0] : gameRound[1];

	return {
		teamNumber,
		matchTotalGamePoints: teamGameRound.team.matchTotalGamePoints
	};
}

function getPreviousRoundScoreComparison(previousGameRound: GameRound): Maybe<PreviousRoundScoreComparison> {
	const previousTeam1 = getTeamMatchTotalGamePoints(previousGameRound, 1);
	const previousTeam2 = getTeamMatchTotalGamePoints(previousGameRound, 2);
	const previousMatchTotalGamePointDifference = Math.abs(
		previousTeam1.matchTotalGamePoints - previousTeam2.matchTotalGamePoints
	);

	if (previousMatchTotalGamePointDifference < minimumMatchTotalGamePointDifference) {
		return nothing();
	}

	if (previousTeam1.matchTotalGamePoints > previousTeam2.matchTotalGamePoints) {
		return just({
			previousLeadingTeam: previousTeam1,
			previousTrailingTeam: previousTeam2
		});
	}

	return just({
		previousLeadingTeam: previousTeam2,
		previousTrailingTeam: previousTeam1
	});
}

function didPreviousTrailingTeamScoreEnoughGamePoints(
	previousTrailingTeam: TeamMatchTotalGamePoints,
	currentGameRound: GameRound
): boolean {
	const currentTrailingTeam = getTeamMatchTotalGamePoints(currentGameRound, previousTrailingTeam.teamNumber);
	const trailingTeamScoredGamePoints =
		currentTrailingTeam.matchTotalGamePoints - previousTrailingTeam.matchTotalGamePoints;

	return trailingTeamScoredGamePoints >= minimumTrailingTeamScoredGamePoints;
}

export function isTurnAround(options: Options): boolean {
	const { gameRounds } = options;

	return getLastTwoGameRounds(gameRounds)
		.andThen(([previousGameRound, currentGameRound]) => {
			return getPreviousRoundScoreComparison(previousGameRound).map((previousRoundScoreComparison) => {
				const { previousTrailingTeam } = previousRoundScoreComparison;

				return didPreviousTrailingTeamScoreEnoughGamePoints(previousTrailingTeam, currentGameRound);
			});
		})
		.unwrapOr(false);
}
