import { eq, or, sql } from "drizzle-orm";
import type { Database } from "../database/database.js";
import { gamePointAudios, type GamePointAudio } from "../database/schema.js";
import type { MatchTotalGamePoints } from "../../shared/game-points.js";

type ReadAudio = Pick<GamePointAudio, "gamePointAudioId" | "gamePoints" | "name">;
type ReadAudioWithoutGamePoints = Pick<ReadAudio, "gamePointAudioId" | "name">;

type ReadAllAudiosOptions = {
	readonly team1MatchTotalGamePoints: MatchTotalGamePoints;
	readonly team2MatchTotalGamePoints: MatchTotalGamePoints;
};

export type AudioRepository = {
	readAllAudios: (options: ReadAllAudiosOptions) => Promise<readonly ReadAudio[]>;
	readAllFunAudios: () => Promise<readonly ReadAudioWithoutGamePoints[]>;
};

type AudioRepositoryOptions = {
	readonly database: Database;
};

export function createAudioRepository(options: AudioRepositoryOptions): AudioRepository {
	const { database } = options;

	return {
		async readAllAudios(readOptions) {
			const { team1MatchTotalGamePoints, team2MatchTotalGamePoints } = readOptions;

			return database
				.select({
					gamePointAudioId: gamePointAudios.gamePointAudioId,
					name: gamePointAudios.name,
					gamePoints: gamePointAudios.gamePoints
				})
				.from(gamePointAudios)
				.where(
					or(
						eq(gamePointAudios.name, "turn_around.m4a"),
						eq(gamePointAudios.name, "attention.m4a"),
						eq(gamePointAudios.gamePoints, team1MatchTotalGamePoints),
						eq(gamePointAudios.name, "to.m4a"),
						eq(gamePointAudios.gamePoints, team2MatchTotalGamePoints),
						eq(gamePointAudios.name, "gspandt.m4a"),
						eq(gamePointAudios.name, "won.m4a")
					)
				)
				.orderBy(
					sql`
						CASE
							WHEN ${gamePointAudios.name} = 'turn_around.m4a' THEN 1
							WHEN ${gamePointAudios.name} = 'attention.m4a' THEN 2
							WHEN ${gamePointAudios.gamePoints} = ${team1MatchTotalGamePoints} THEN 3
							WHEN ${gamePointAudios.name} = 'to.m4a' THEN 4
							WHEN ${gamePointAudios.gamePoints} = ${team2MatchTotalGamePoints} THEN 5
							WHEN ${gamePointAudios.name} = 'gspandt.m4a' THEN 6
							WHEN ${gamePointAudios.name} = 'won.m4a' THEN 7
							ELSE 8
						END
					`
				);
		},

		readAllFunAudios() {
			return database
				.select({
					gamePointAudioId: gamePointAudios.gamePointAudioId,
					name: gamePointAudios.name
				})
				.from(gamePointAudios)
				.where(
					or(
						eq(gamePointAudios.name, "der_is_guad.m4a"),
						eq(gamePointAudios.name, "der_war_deier.m4a"),
						eq(gamePointAudios.name, "des_is_a_lauf.m4a"),
						eq(gamePointAudios.name, "do_legst_di_nida.m4a"),
						eq(gamePointAudios.name, "do_sagst_nix_ma.m4a"),
						eq(gamePointAudios.name, "gehts_a_oder_gehts_a.m4a"),
						eq(gamePointAudios.name, "kimmt_da_no_woas.m4a"),
						eq(gamePointAudios.name, "machst_du_no_a_stich.m4a"),
						eq(gamePointAudios.name, "sama_gspandt.m4a"),
						eq(gamePointAudios.name, "seids_eigschlafa.m4a"),
						eq(gamePointAudios.name, "spuilts_lieber_uno.m4a"),
						eq(gamePointAudios.name, "was_isn_ogsogt.m4a")
					)
				);
		}
	};
}
