import { desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { Database } from "../database/database.js";
import { games, teams } from "../database/schema.js";
import type { AudioRepository } from "../audio/repository.js";
import type { isTurnAround } from "../audio/turn_around.js";
import type { PlayersRepository } from "../players/players-repository.js";
import type { SessionRepository } from "../session/session-repository.js";
import { createGameRouter } from "./routers/game.js";
import { createSessionGameRouter } from "./routers/session-game.js";
import { createAudioRouter } from "./routers/audio.js";
import type { TRPCRouter } from "./index.js";

type Options = {
	readonly trpcRouter: TRPCRouter;
	readonly database: Database;
	readonly audioRepository: AudioRepository;
	readonly playersRepository: PlayersRepository;
	readonly sessionRepository: SessionRepository;
	readonly isTurnAround: typeof isTurnAround;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- tRPC works with type inference
export function createTrpcApplicationRouter(options: Options) {
	const { trpcRouter, database, audioRepository, playersRepository, sessionRepository, isTurnAround } = options;
	const { router, publicProcedure, protectedProcedure } = trpcRouter;

	const gameRouter = createGameRouter({ trpcRouter });
	const sessionGameRouter = createSessionGameRouter({ trpcRouter, sessionRepository });
	const audioRouter = createAudioRouter({ trpcRouter, audioRepository, isTurnAround });

	return router({
		players: protectedProcedure.query(async () => {
			return playersRepository.allPlayers.match({
				Resolved(allPlayers) {
					return allPlayers;
				},
				Rejected(reason) {
					throw new TRPCError({
						code: "NOT_FOUND",
						cause: reason
					});
				}
			});
		}),

		teams: publicProcedure.query(async () => {
			return database.select().from(teams).all();
		}),

		games: publicProcedure.query(async () => {
			return database.select().from(games).orderBy(desc(games.createdAt)).all();
		}),

		session: publicProcedure.query(async (procedureOptions) => {
			return procedureOptions.ctx.session
				.map((session) => {
					return { token: session.token };
				})
				.match({
					Just(session) {
						return session;
					},
					Nothing() {
						return null;
					}
				});
		}),

		game: gameRouter,

		sessionGame: sessionGameRouter,

		audio: audioRouter
	});
}

export type TRPCApplicationRouter = ReturnType<typeof createTrpcApplicationRouter>;
