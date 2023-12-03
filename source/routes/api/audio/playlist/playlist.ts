import type sample from "lodash.sample";
import Result from "true-myth/result";
import type { Teams } from "./query-string-schema.js";
import { findRandomAudioFileWithPrefix } from "./random-audio-file.js";

export type CreatePlaylistDependencies = {
	readonly randomCollectionElement: typeof sample;
};

export type CreatePlaylistOptions = {
	readonly baseUrl: URL;
	readonly mediaBucket: R2Bucket;
	readonly teams: Teams;
	readonly includeStretched: boolean;
};

export async function createPlaylist(
	dependencies: CreatePlaylistDependencies,
	options: CreatePlaylistOptions,
): Promise<Result<readonly URL[], Error>> {
	const { randomCollectionElement } = dependencies;
	const { baseUrl, mediaBucket, teams, includeStretched } = options;

	const attentionAudioFileResult = await findRandomAudioFileWithPrefix(
		{ mediaBucket, randomCollectionElement },
		{
			prefix: "attention",
			baseUrl,
		},
	);

	if (attentionAudioFileResult.isErr) {
		return Result.err(attentionAudioFileResult.error);
	}

	const playlist: URL[] = [attentionAudioFileResult.value];

	let stretched = false;

	for await (const [index, team] of teams.entries()) {
		const { isStretched, totalGamePoints } = team;

		if (includeStretched && isStretched) {
			stretched = true;
		}

		if (index === 1) {
			playlist.push(new URL("zu.m4a", baseUrl));
		}

		if (totalGamePoints === 0) {
			const zeroGamePointsAudioFile = await findRandomAudioFileWithPrefix(
				{ mediaBucket, randomCollectionElement },
				{
					prefix: "zero",
					baseUrl,
				},
			);

			if (zeroGamePointsAudioFile.isErr) {
				return Result.err(zeroGamePointsAudioFile.error);
			}

			playlist.push(zeroGamePointsAudioFile.value);
			continue;
		}

		playlist.push(new URL(`${totalGamePoints}.m4a`, baseUrl));
	}

	if (stretched) {
		playlist.push(new URL("gspannt.m4a", baseUrl));
	}

	return Result.ok(playlist);
}
