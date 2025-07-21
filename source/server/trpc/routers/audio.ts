import { TRPCError } from "@trpc/server";
import { object, boolean } from "valibot";
import type { AudioRepository } from "../../audio/repository.ts";
import type { isTurnAround } from "../../audio/turn_around.ts";
import type { TRPCRouter } from "../index.ts";
import { notPersistedTeamSchema } from "../../../shared/team.ts";
import { gameRoundsSchema } from "../../../shared/game-rounds.ts";
import { generateAudioPlaylist } from "../../audio/playlist.ts";

type Options = {
	readonly trpcRouter: TRPCRouter;
	readonly audioRepository: AudioRepository;
	readonly isTurnAround: typeof isTurnAround;
};

export function createAudioRouter(options: Options) {
	const {
		trpcRouter: { router, publicProcedure },
		audioRepository,
		isTurnAround,
	} = options;

	return router({
		generatePlaylist: publicProcedure
			.input(
				object({
					team1: notPersistedTeamSchema,
					team2: notPersistedTeamSchema,
					gameRounds: gameRoundsSchema,
					hasWon: boolean(),
				}),
			)
			.query(async ({ input }) => {
				const { team1, team2, gameRounds, hasWon } = input;

				const allAudios = await audioRepository.readAllAudios({
					team1MatchTotalGamePoints: team1.matchTotalGamePoints,
					team2MatchTotalGamePoints: team2.matchTotalGamePoints,
				});

				const audioPlaylist = generateAudioPlaylist({
					allAudios,
					team1MatchTotalGamePoints: team1.matchTotalGamePoints,
					team2MatchTotalGamePoints: team2.matchTotalGamePoints,
					gameRounds,
					isStretched: !hasWon && (team1.isStretched || team2.isStretched),
					hasWon,
					isTurnAround,
				}).unwrapOrElse(() => {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Could not find any attention audio files",
					});
				});

				return audioPlaylist.map((gamePointAudio) => {
					return `/api/audio/${gamePointAudio.gamePointAudioId}`;
				});
			}),
	});
}
