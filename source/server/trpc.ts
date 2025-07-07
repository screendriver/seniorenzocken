import { initTRPC } from "@trpc/server";
import { desc } from "drizzle-orm";
import type { Database } from "./database/database.ts";
import { games, players, teams } from "./database/schema.ts";

const trpc = initTRPC.create();

const router = trpc.router;

const publicProcedure = trpc.procedure;

type Options = {
	readonly database: Database;
};

export function createTrpcRouter(options: Options) {
	const { database } = options;

	const builtRouter = router({
		players: publicProcedure.query(() => {
			return database.select().from(players).orderBy(players.nickname).all();
		}),

		teams: publicProcedure.query(() => {
			return database.select().from(teams).all();
		}),

		games: publicProcedure.query(() => {
			return database.select().from(games).orderBy(desc(games.dateTimePlayed)).all();
		}),
	});

	return builtRouter;
}
