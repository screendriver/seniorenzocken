import { desc } from "drizzle-orm";
import type { Database } from "../database/database.js";
import { games, players, teams } from "../database/schema.js";
import type { AudioRepository } from "../audio/repository.js";
import type { isTurnAround } from "../audio/turn_around.js";
import { createGameRouter } from "./routers/game.js";
import { createAudioRouter } from "./routers/audio.js";
import type { TRPCRouter } from "./index.js";

type Options = {
	readonly trpcRouter: TRPCRouter;
	readonly database: Database;
	readonly audioRepository: AudioRepository;
	readonly isTurnAround: typeof isTurnAround;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- tRPC works with type inference
export function createTrpcApplicationRouter(options: Options) {
	const { trpcRouter, database, audioRepository, isTurnAround } = options;
	const { router, publicProcedure } = trpcRouter;

	const gameRouter = createGameRouter({ trpcRouter });
	const audioRouter = createAudioRouter({ trpcRouter, audioRepository, isTurnAround });

	return router({
		players: publicProcedure.query(async () => {
			return database.select().from(players).orderBy(players.nickname).all();
		}),

		teams: publicProcedure.query(async () => {
			return database.select().from(teams).all();
		}),

		games: publicProcedure.query(async () => {
			return database.select().from(games).orderBy(desc(games.createdAt)).all();
		}),

		game: gameRouter,

		audio: audioRouter
	});
}

export type TRPCApplicationRouter = ReturnType<typeof createTrpcApplicationRouter>;
