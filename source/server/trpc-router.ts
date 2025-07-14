import { initTRPC, TRPCError } from "@trpc/server";
import { desc } from "drizzle-orm";
import * as v from "valibot";
import type { Database } from "./database/database.ts";
import { games, players, teams } from "./database/schema.ts";
import { matchTotalGamePointsSchema } from "./game-points/game-points.ts";
import { generateAudioPlaylist } from "./audio/playlist.ts";
import type { AudioRepository } from "./audio/repository.ts";

const trpc = initTRPC.create();

const router = trpc.router;

const publicProcedure = trpc.procedure;

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

		generateAudioPlaylist: publicProcedure
			.input(
				v.object({
					team1MatchTotalGamePoints: matchTotalGamePointsSchema,
					team2MatchTotalGamePoints: matchTotalGamePointsSchema,
					isStretched: v.boolean(),
					hasWon: v.boolean(),
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
					return [`/api/audio/${gamePointAudio.gamePointAudioId}`];
				});
			}),
	});
}
