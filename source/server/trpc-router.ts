import { initTRPC, TRPCError } from "@trpc/server";
import { desc } from "drizzle-orm";
import { parse, object, boolean, pipe, nonEmpty } from "valibot";
import { last } from "true-myth/maybe";
import type { Database } from "./database/database.ts";
import { games, players, teams } from "./database/schema.ts";
import { matchTotalGamePointsSchema } from "../shared/game-points.ts";
import { generateAudioPlaylist } from "./audio/playlist.ts";
import type { AudioRepository } from "./audio/repository.ts";
import { notPersistedTeamSchema, type NotPersistedTeam } from "../shared/team.ts";
import { gameRoundsSchema } from "../shared/game-rounds.ts";
import { isStretched } from "./stretched/stretched.ts";
import { shouldShowConfetti } from "./confetti/confetti.ts";
import { isGameOver } from "./game-over/game-over.ts";

const trpc = initTRPC.create();

const router = trpc.router;

const publicProcedure = trpc.procedure;

type NewGameProcedure = {
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
	readonly database: Database;
	readonly audioRepository: AudioRepository;
};

export function createTrpcRouter(options: Options) {
	const { database, audioRepository } = options;

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

		newGame: publicProcedure.query<NewGameProcedure>(() => {
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
				const updatedTeam1: NotPersistedTeam = {
					...team1,
					currentRoundGamePoints: 0,
					matchTotalGamePoints: parse(
						matchTotalGamePointsSchema,
						team1.currentRoundGamePoints + team1.matchTotalGamePoints,
					),
					isStretched: isStretched(team1.matchTotalGamePoints),
				};
				const updatedTeam2: NotPersistedTeam = {
					...team2,
					currentRoundGamePoints: 0,
					matchTotalGamePoints: parse(
						matchTotalGamePointsSchema,
						team2.currentRoundGamePoints + team2.matchTotalGamePoints,
					),
					isStretched: isStretched(team2.matchTotalGamePoints),
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

		generateAudioPlaylist: publicProcedure
			.input(
				object({
					team1MatchTotalGamePoints: matchTotalGamePointsSchema,
					team2MatchTotalGamePoints: matchTotalGamePointsSchema,
					isStretched: boolean(),
					hasWon: boolean(),
				}),
			)
			.query(async ({ input }) => {
				const allAudios = await audioRepository.readAllAudios({
					team1MatchTotalGamePoints: input.team1MatchTotalGamePoints,
					team2MatchTotalGamePoints: input.team2MatchTotalGamePoints,
				});

				const audioPlaylist = generateAudioPlaylist({
					allAudios,
					team1MatchTotalGamePoints: input.team1MatchTotalGamePoints,
					team2MatchTotalGamePoints: input.team2MatchTotalGamePoints,
					isStretched: input.isStretched,
					hasWon: input.hasWon,
				}).unwrapOrElse(() => {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Could not find any attention audio files",
					});
				});

				return audioPlaylist.map((gamePointAudio) => {
					return `/api/audio/${gamePointAudio.gamePointAudioId}`;
				});
			}),
	});
}
