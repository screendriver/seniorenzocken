import { initTRPC, TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import * as v from "valibot";
import sample from "lodash.sample";
import Maybe from "true-myth/maybe";
import type { Database } from "./database/database.ts";
import { gamePointAudios, games, players, teams } from "./database/schema.ts";
import { gamePointsPerRoundSchema } from "./game-points/game-points.ts";

const trpc = initTRPC.create();

const router = trpc.router;

const publicProcedure = trpc.procedure;

type Options = {
	readonly database: Database;
};

export function createTrpcRouter(options: Options) {
	const { database } = options;

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
					team1Points: gamePointsPerRoundSchema,
					team2Points: gamePointsPerRoundSchema,
				}),
			)
			.query(async () => {
				const attentionAudios = await database
					.select({ gamePointAudioId: gamePointAudios.gamePointAudioId })
					.from(gamePointAudios)
					.where(eq(gamePointAudios.name, "attention.m4a"));

				const { gamePointAudioId: attentionGamePointAudioId } = Maybe.of(sample(attentionAudios)).unwrapOrElse(
					() => {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Could not find any attention audio files",
						});
					},
				);

				return [`/api/audio/${attentionGamePointAudioId}`];
			}),
	});
}
