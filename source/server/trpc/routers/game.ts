import { TRPCError } from "@trpc/server";
import { object, parse, pipe, nonEmpty } from "valibot";
import { last } from "true-myth/maybe";
import { identity } from "@enormora/identity-esm";
import type { TRPCRouter } from "../index.js";
import {
	type NotPersistedTeam,
	type NotPersistedTeam1,
	type NotPersistedTeam2,
	notPersistedTeam1Schema,
	notPersistedTeam2Schema
} from "../../../shared/team.js";
import { type GameRound, type GameRounds, gameRoundsSchema } from "../../../shared/game-rounds.js";
import { matchTotalGamePointsSchema } from "../../../shared/game-points.js";
import { isStretched } from "../../stretched/stretched.js";
import { isGameOver } from "../../game-over/game-over.js";
import { shouldShowConfetti } from "../../confetti/confetti.js";
import { determineWinnerTeam } from "../../team/team.js";

type NewGameProcedureOutput = {
	readonly team1: NotPersistedTeam1;
	readonly team2: NotPersistedTeam2;
	readonly isGameRunning: false;
	readonly isGameOver: false;
	readonly showConfetti: false;
	readonly gameRounds: GameRounds;
};

type StartGameMutationOutput = {
	readonly isGameRunning: true;
};

type NextGameRoundMutationOutput = {
	readonly team1: NotPersistedTeam1;
	readonly team2: NotPersistedTeam2;
	readonly isGameRunning: boolean;
	readonly isGameOver: boolean;
	readonly showConfetti: boolean;
	readonly gameRounds: GameRounds;
};

type PreviousGameRoundMutationOutput = {
	readonly team1: NotPersistedTeam1;
	readonly team2: NotPersistedTeam2;
	readonly gameRounds: GameRounds;
};

type Options = {
	readonly trpcRouter: TRPCRouter;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- tRPC works with type inference
export function createGameRouter(options: Options) {
	const {
		trpcRouter: { router, publicProcedure }
	} = options;

	return router({
		new: publicProcedure.query<NewGameProcedureOutput>(() => {
			return {
				team1: {
					teamNumber: 1,
					name: "",
					currentRoundGamePoints: 0,
					matchTotalGamePoints: 0,
					isStretched: false
				},
				team2: {
					teamNumber: 2,
					name: "",
					currentRoundGamePoints: 0,
					matchTotalGamePoints: 0,
					isStretched: false
				},
				isGameRunning: false,
				isGameOver: false,
				showConfetti: false,
				gameRounds: []
			};
		}),

		start: publicProcedure
			.input(object({ team1: notPersistedTeam1Schema, team2: notPersistedTeam2Schema }))
			.mutation<StartGameMutationOutput>(() => {
				return {
					isGameRunning: true
				};
			}),

		nextRound: publicProcedure
			.input(
				object({
					team1: notPersistedTeam1Schema,
					team2: notPersistedTeam2Schema,
					gameRounds: gameRoundsSchema
				})
			)
			.mutation<NextGameRoundMutationOutput>((resolverOptions) => {
				const {
					input: { team1, team2, gameRounds }
				} = resolverOptions;

				const team1MatchTotalGamePoints = parse(
					matchTotalGamePointsSchema,
					team1.currentRoundGamePoints + team1.matchTotalGamePoints
				);
				const team2MatchTotalGamePoints = parse(
					matchTotalGamePointsSchema,
					team2.currentRoundGamePoints + team2.matchTotalGamePoints
				);
				const updatedTeam1: NotPersistedTeam1 = {
					...team1,
					currentRoundGamePoints: 0,
					matchTotalGamePoints: team1MatchTotalGamePoints,
					isStretched: isStretched(team1MatchTotalGamePoints)
				};
				const updatedTeam2: NotPersistedTeam2 = {
					...team2,
					currentRoundGamePoints: 0,
					matchTotalGamePoints: team2MatchTotalGamePoints,
					isStretched: isStretched(team2MatchTotalGamePoints)
				};
				const gameOver = isGameOver(updatedTeam1, updatedTeam2);
				const newGameRound: GameRound = [
					{
						team: updatedTeam1,
						hasWonGameRound: team1.currentRoundGamePoints > team2.currentRoundGamePoints
					},
					{
						team: updatedTeam2,
						hasWonGameRound: team2.currentRoundGamePoints > team1.currentRoundGamePoints
					}
				];

				return {
					team1: updatedTeam1,
					team2: updatedTeam2,
					isGameRunning: !gameOver,
					isGameOver: gameOver,
					showConfetti: shouldShowConfetti(team1, team2),
					gameRounds: [...gameRounds, newGameRound]
				};
			}),

		previousRound: publicProcedure
			.input(
				object({
					gameRounds: pipe(gameRoundsSchema, nonEmpty())
				})
			)
			.mutation<PreviousGameRoundMutationOutput>((resolverOptions) => {
				const {
					input: { gameRounds }
				} = resolverOptions;

				const remainingGameRounds = gameRounds.toSpliced(-1);

				return last(remainingGameRounds)
					.andThen(identity)
					.match({
						Just(previousGameRound) {
							return {
								team1: previousGameRound[0].team,
								team2: previousGameRound[1].team,
								gameRounds: remainingGameRounds
							};
						},
						Nothing() {
							const firstGameRound = gameRounds[0];

							if (firstGameRound === undefined) {
								throw new TRPCError({ code: "NOT_FOUND" });
							}

							return {
								team1: { ...firstGameRound[0].team, matchTotalGamePoints: 0 },
								team2: { ...firstGameRound[1].team, matchTotalGamePoints: 0 },
								gameRounds: []
							};
						}
					});
			}),

		determineWinnerTeam: publicProcedure
			.input(object({ team1: notPersistedTeam1Schema, team2: notPersistedTeam2Schema }))
			.query<NotPersistedTeam>((resolverOptions) => {
				const {
					input: { team1, team2 }
				} = resolverOptions;

				return determineWinnerTeam(team1, team2).match({
					Ok(winnerTeam) {
						return winnerTeam;
					},
					Err(error) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Could not determine winner team",
							cause: error
						});
					}
				});
			})
	});
}
