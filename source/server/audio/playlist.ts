import Maybe, { of, just, find } from "true-myth/maybe";
import Result from "true-myth/result";
import { toOkOrErr } from "true-myth/toolbelt";
import sample from "lodash.sample";
import type { GamePointAudio } from "../database/schema.ts";
import type { MatchTotalGamePoints } from "../../shared/game-points.ts";
import type { GameRounds } from "../../shared/game-rounds.ts";
import { isATurnAround } from "./turn_around.ts";

export type SelectedGamePointAudio = Pick<GamePointAudio, "gamePointAudioId" | "name" | "gamePoints">;

function randomAudioFile(audioFiles: readonly SelectedGamePointAudio[]): Maybe<SelectedGamePointAudio> {
	return of(sample(audioFiles));
}

function findTeamPointsAudio(
	matchTotalGamePoints: MatchTotalGamePoints,
	allAudios: readonly SelectedGamePointAudio[],
): Maybe<SelectedGamePointAudio> {
	if (matchTotalGamePoints === 0) {
		const zeroAudios = allAudios.filter((audio) => audio.name === "zero.m4a");

		return randomAudioFile(zeroAudios);
	}

	return find((audio) => audio.gamePoints === matchTotalGamePoints, allAudios);
}

function createAudioPlaylist(attentionAudio: SelectedGamePointAudio) {
	return (team1Audio: SelectedGamePointAudio) => {
		return (toAudio: SelectedGamePointAudio) => {
			return (team2Audio: SelectedGamePointAudio): SelectedGamePointAudio[] => {
				return [attentionAudio, team1Audio, toAudio, team2Audio];
			};
		};
	};
}

export type Options = {
	readonly allAudios: readonly SelectedGamePointAudio[];
	readonly team1MatchTotalGamePoints: MatchTotalGamePoints;
	readonly team2MatchTotalGamePoints: MatchTotalGamePoints;
	readonly gameRounds: GameRounds;
	readonly isStretched: boolean;
	readonly hasWon: boolean;
};

export function generateAudioPlaylist(options: Options): Result<readonly SelectedGamePointAudio[], Error> {
	const { allAudios, team1MatchTotalGamePoints, team2MatchTotalGamePoints, gameRounds, isStretched, hasWon } =
		options;

	const attentionAudios = allAudios.filter((audio) => audio.name === "attention.m4a");
	const attentionAudio = randomAudioFile(attentionAudios);
	const team1Audio = findTeamPointsAudio(team1MatchTotalGamePoints, allAudios);
	const toAudio = find((audio) => audio.name === "to.m4a", allAudios);
	const team2Audio = findTeamPointsAudio(team2MatchTotalGamePoints, allAudios);

	const audioPlaylist = just(createAudioPlaylist)
		.ap(attentionAudio)
		.ap(team1Audio)
		.ap(toAudio)
		.ap(team2Audio)
		.andThen((audioPlaylistValue) => {
			if (isATurnAround({ gameRounds })) {
				return find((audio) => audio.name === "turn_around.m4a", allAudios).map((turnAroundAudio) => {
					return [turnAroundAudio, ...audioPlaylistValue];
				});
			}

			return just(audioPlaylistValue);
		})
		.andThen((audioPlaylistValue) => {
			if (isStretched) {
				return find((audio) => audio.name === "stretched.m4a", allAudios).map((stretchedAudio) => {
					return [...audioPlaylistValue, stretchedAudio];
				});
			}

			return just(audioPlaylistValue);
		})
		.andThen((audioPlaylistValue) => {
			if (hasWon) {
				return find((audio) => audio.name === "won.m4a", allAudios).map((wonAudio) => {
					return [...audioPlaylistValue, wonAudio];
				});
			}

			return just(audioPlaylistValue);
		});

	return toOkOrErr(new Error("Can't generate audio playlist"), audioPlaylist);
}
