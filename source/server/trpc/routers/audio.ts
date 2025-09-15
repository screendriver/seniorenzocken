import { TRPCError } from "@trpc/server";
import { object, boolean } from "valibot";
import { sample } from "es-toolkit";
import { of } from "true-myth/maybe";
import { fromMaybe } from "true-myth/toolbelt";
import type { AudioRepository } from "../../audio/repository.js";
import type { isTurnAround } from "../../audio/turn_around.js";
import type { TRPCRouter } from "../index.js";
import { notPersistedTeam1Schema, notPersistedTeam2Schema } from "../../../shared/team.js";
import { gameRoundsSchema } from "../../../shared/game-rounds.js";
import { generateAudioPlaylist } from "../../audio/playlist.js";

export type AudioRouterOptions = {
	readonly trpcRouter: TRPCRouter;
	readonly audioRepository: AudioRepository;
	readonly isTurnAround: typeof isTurnAround;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- trPC works with type inference
export function createAudioRouter(options: AudioRouterOptions) {
	const {
		trpcRouter: { router, publicProcedure },
		audioRepository,
		isTurnAround
	} = options;

	return router({
		gamePointsPlaylist: publicProcedure
			.input(
				object({
					team1: notPersistedTeam1Schema,
					team2: notPersistedTeam2Schema,
					gameRounds: gameRoundsSchema,
					hasWon: boolean()
				})
			)
			.query(async (resolverOptions) => {
				const {
					input: { team1, team2, gameRounds, hasWon }
				} = resolverOptions;

				const allAudiosResult = await audioRepository.readGamePointsAudios({
					team1MatchTotalGamePoints: team1.matchTotalGamePoints,
					team2MatchTotalGamePoints: team2.matchTotalGamePoints
				});

				const audioPlaylistResult = allAudiosResult.andThen((allAudios) => {
					return generateAudioPlaylist({
						allAudios,
						team1MatchTotalGamePoints: team1.matchTotalGamePoints,
						team2MatchTotalGamePoints: team2.matchTotalGamePoints,
						gameRounds,
						isStretched: !hasWon && (team1.isStretched || team2.isStretched),
						hasWon,
						isTurnAround
					});
				});

				return audioPlaylistResult.match({
					Ok(audioPlaylist) {
						return audioPlaylist.map((gamePointAudio) => {
							return `/api/audio/${gamePointAudio.gamePointAudioId}`;
						});
					},
					Err(error) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Could not find any attention audio files",
							cause: error
						});
					}
				});
			}),

		getRandomFunAudio: publicProcedure.query(async () => {
			const allFunAudiosResult = await audioRepository.readAllFunAudios();

			return allFunAudiosResult
				.andThen((allFunAudios) => {
					const randomFunAudio = of(sample(allFunAudios));

					return fromMaybe(new Error("All fun audios were empty"), randomFunAudio);
				})
				.match({
					Ok(randomAudio) {
						return `/api/audio/${randomAudio.gamePointAudioId}`;
					},
					Err() {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Could not find any fun audio files"
						});
					}
				});
		})
	});
}
