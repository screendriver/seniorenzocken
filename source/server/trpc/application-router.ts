import { desc } from "drizzle-orm";
import { parse, object, pipe, nonEmpty } from "valibot";
import { last } from "true-myth/maybe";
import type { TRPCRouter } from "./index.ts";
import type { Database } from "../database/database.ts";
import { games, players, teams } from "../database/schema.ts";
import { matchTotalGamePointsSchema } from "../../shared/game-points.ts";
import type { AudioRepository } from "../audio/repository.ts";
import { notPersistedTeamSchema, type NotPersistedTeam } from "../../shared/team.ts";
import { gameRoundsSchema } from "../../shared/game-rounds.ts";
import { isStretched } from "../stretched/stretched.ts";
import { shouldShowConfetti } from "../confetti/confetti.ts";
import { isGameOver } from "../game-over/game-over.ts";
import type { isTurnAround } from "../audio/turn_around.ts";
import { createAudioRouter } from "./routers/audio.ts";

type NewGameProcedureOutput = {
	readonly team1: NotPersistedTeam;
	readonly team2: NotPersistedTeam;
	readonly isGameRunning: false;
	readonly isGameOver: false;
	readonly showConfetti: false;
	readonly gameRounds: [NotPersistedTeam, NotPersistedTeam][];
};

type StartGameMutationOutput = {
	readonly isGameRunning: true;
};

type NextGameRoundMutationOutput = {
	readonly team1: NotPersistedTeam;
	readonly team2: NotPersistedTeam;
	readonly isGameRunning: boolean;
	readonly isGameOver: boolean;
	readonly showConfetti: boolean;
	readonly gameRounds: [NotPersistedTeam, NotPersistedTeam][];
};

type PreviousGameRoundMutationOutput = {
	readonly team1: NotPersistedTeam;
	readonly team2: NotPersistedTeam;
	readonly gameRounds: [NotPersistedTeam, NotPersistedTeam][];
};

type Options = {
	readonly trpcRouter: TRPCRouter;
	readonly database: Database;
	readonly audioRepository: AudioRepository;
	readonly isTurnAround: typeof isTurnAround;
};

export function createTrpcApplicationRouter(options: Options) {
	const { trpcRouter, database, audioRepository, isTurnAround } = options;
	const { router, publicProcedure } = trpcRouter;

	const audioRouter = createAudioRouter({ trpcRouter, audioRepository, isTurnAround });

	return router({
		players: publicProcedure.query(() => {
			return database.select().from(players).orderBy(players.nickname).all();
		}),

		teams: publicProcedure.query(() => {
			return database.select().from(teams).all();
		}),

		games: publicProcedure.query(() => {
			return database.select().from(games).orderBy(desc(games.createdAt)).all();
		}),

		newGame: publicProcedure.query<NewGameProcedureOutput>(() => {
			return {
				team1: {
					teamNumber: 1,
					name: "",
					currentRoundGamePoints: 0,
					matchTotalGamePoints: 0,
					isStretched: false,
				},
				team2: {
					teamNumber: 2,
					name: "",
					currentRoundGamePoints: 0,
					matchTotalGamePoints: 0,
					isStretched: false,
				},
				isGameRunning: false,
				isGameOver: false,
				showConfetti: false,
				gameRounds: [],
			};
		}),

		startGame: publicProcedure
			.input(object({ team1: notPersistedTeamSchema, team2: notPersistedTeamSchema }))
			.mutation<StartGameMutationOutput>(() => {
				return {
					isGameRunning: true,
				};
			}),

		nextGameRound: publicProcedure
			.input(
				object({
					team1: notPersistedTeamSchema,
					team2: notPersistedTeamSchema,
					gameRounds: gameRoundsSchema,
				}),
			)
			.mutation<NextGameRoundMutationOutput>(({ input }) => {
				const { team1, team2, gameRounds } = input;

				const team1MatchTotalGamePoints = parse(
					matchTotalGamePointsSchema,
					team1.currentRoundGamePoints + team1.matchTotalGamePoints,
				);
				const team2MatchTotalGamePoints = parse(
					matchTotalGamePointsSchema,
					team2.currentRoundGamePoints + team2.matchTotalGamePoints,
				);
				const updatedTeam1: NotPersistedTeam = {
					...team1,
					currentRoundGamePoints: 0,
					matchTotalGamePoints: team1MatchTotalGamePoints,
					isStretched: isStretched(team1MatchTotalGamePoints),
				};
				const updatedTeam2: NotPersistedTeam = {
					...team2,
					currentRoundGamePoints: 0,
					matchTotalGamePoints: team2MatchTotalGamePoints,
					isStretched: isStretched(team2MatchTotalGamePoints),
				};
				const gameOver = isGameOver(updatedTeam1, updatedTeam2);

				return {
					team1: updatedTeam1,
					team2: updatedTeam2,
					isGameRunning: !gameOver,
					isGameOver: gameOver,
					showConfetti: shouldShowConfetti(team1, team2),
					gameRounds: [...gameRounds, [updatedTeam1, updatedTeam2]],
				};
			}),

		previousGameRound: publicProcedure
			.input(
				object({
					gameRounds: pipe(gameRoundsSchema, nonEmpty()),
				}),
			)
			.mutation<PreviousGameRoundMutationOutput>(({ input }) => {
				const { gameRounds } = input;

				const remainingGameRounds = gameRounds.toSpliced(-1);

				return last(remainingGameRounds)
					.andThen((previousGameRound) => {
						return previousGameRound;
					})
					.match({
						Just(previousGameRound) {
							return {
								team1: previousGameRound[0],
								team2: previousGameRound[1],
								gameRounds: remainingGameRounds,
							};
						},
						Nothing() {
							return {
								team1: { ...gameRounds[0][0], matchTotalGamePoints: 0 },
								team2: { ...gameRounds[0][1], matchTotalGamePoints: 0 },
								gameRounds: [],
							};
						},
					});
			}),

		audio: audioRouter,
	});
}
