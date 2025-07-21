import { eq, or, sql } from "drizzle-orm";
import type { Database } from "../database/database.ts";
import { gamePointAudios, type GamePointAudio } from "../database/schema.ts";
import type { MatchTotalGamePoints } from "../../shared/game-points.ts";

type ReadAudio = Pick<GamePointAudio, "gamePointAudioId" | "name" | "gamePoints">;

type ReadAllAudiosOptions = {
	readonly team1MatchTotalGamePoints: MatchTotalGamePoints;
	readonly team2MatchTotalGamePoints: MatchTotalGamePoints;
};

export type AudioRepository = {
	readAllAudios(options: ReadAllAudiosOptions): Promise<readonly ReadAudio[]>;
};

type AudioRepositoryOptions = {
	readonly database: Database;
};

export function createAudioRepository(options: AudioRepositoryOptions): AudioRepository {
	const { database } = options;

	return {
		async readAllAudios(options) {
			const { team1MatchTotalGamePoints, team2MatchTotalGamePoints } = options;

			return database
				.select({
					gamePointAudioId: gamePointAudios.gamePointAudioId,
					name: gamePointAudios.name,
					gamePoints: gamePointAudios.gamePoints,
				})
				.from(gamePointAudios)
				.where(
					or(
						eq(gamePointAudios.name, "turn_around.m4a"),
						eq(gamePointAudios.name, "attention.m4a"),
						eq(gamePointAudios.gamePoints, team1MatchTotalGamePoints),
						eq(gamePointAudios.name, "to.m4a"),
						eq(gamePointAudios.gamePoints, team2MatchTotalGamePoints),
						eq(gamePointAudios.name, "stretched.m4a"),
						eq(gamePointAudios.name, "won.m4a"),
					),
				)
				.orderBy(
					sql`
						CASE
							WHEN ${gamePointAudios.name} = 'turn_around.m4a' THEN 1
							WHEN ${gamePointAudios.name} = 'attention.m4a' THEN 2
							WHEN ${gamePointAudios.gamePoints} = ${team1MatchTotalGamePoints} THEN 3
							WHEN ${gamePointAudios.name} = 'to.m4a' THEN 4
							WHEN ${gamePointAudios.gamePoints} = ${team2MatchTotalGamePoints} THEN 5
							WHEN ${gamePointAudios.name} = 'stretched.m4a' THEN 6
							WHEN ${gamePointAudios.name} = 'won.m4a' THEN 7
							ELSE 8
						END
					`,
				);
		},
	};
}
