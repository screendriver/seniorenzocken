import { Task, tryOrElse } from "true-myth/task";
import { safeParse, summarize } from "valibot";
import type { Database } from "../database/database.js";
import { players as playersDatabaseSchema } from "../database/raw-database-schema.js";
import { type Players, playersSchema } from "./player-schema.js";

export type PlayersRepository = {
	get allPlayers(): Task<Players, Error>;
};

export type PlayersRepositoryOptions = {
	readonly database: Database;
};

export function createPlayersRepository(options: PlayersRepositoryOptions): PlayersRepository {
	const { database } = options;

	return {
		get allPlayers() {
			return tryOrElse(
				(error: unknown) => {
					return new Error("Could not retrieve all players from database", { cause: error });
				},
				async () => {
					return database.select().from(playersDatabaseSchema).orderBy(playersDatabaseSchema.nickname);
				}
			).andThen((allPlayersFromDatabase) => {
				const { success, output, issues } = safeParse(playersSchema, allPlayersFromDatabase);

				if (success) {
					return Task.resolve(output);
				}

				return Task.reject(new Error(summarize(issues)));
			});
		}
	};
}
