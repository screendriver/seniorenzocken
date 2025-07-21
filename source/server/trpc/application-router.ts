import { desc } from "drizzle-orm";
import type { TRPCRouter } from "./index.ts";
import type { Database } from "../database/database.ts";
import { games, players, teams } from "../database/schema.ts";
import type { AudioRepository } from "../audio/repository.ts";
import type { isTurnAround } from "../audio/turn_around.ts";
import { createGameRouter } from "./routers/game.ts";
import { createAudioRouter } from "./routers/audio.ts";

type Options = {
	readonly trpcRouter: TRPCRouter;
	readonly database: Database;
	readonly audioRepository: AudioRepository;
	readonly isTurnAround: typeof isTurnAround;
};

export function createTrpcApplicationRouter(options: Options) {
	const { trpcRouter, database, audioRepository, isTurnAround } = options;
	const { router, publicProcedure } = trpcRouter;

	const gameRouter = createGameRouter({ trpcRouter });
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

		game: gameRouter,

		audio: audioRouter,
	});
}
