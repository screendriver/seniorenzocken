import type sample from "lodash.sample";
import Maybe from "true-myth/maybe";
import type { Teams } from "../team/team-schema.js";

const attentionAudioFiles = ["attention_1", "attention_2", "attention_3", "attention_4"];
const zeroPointsAudioFiles = ["0_1", "0_2", "0_3", "0_4", "0_5", "0_6"];

export interface CreatePlaylistOptions {
	readonly teams: Teams;
	readonly includeStretched: boolean;
	readonly randomCollectionElement: typeof sample;
}

function findAttentionAudioFile(randomCollectionElement: typeof sample): string {
	const randomAttentionAudioFile = Maybe.of(randomCollectionElement(attentionAudioFiles));

	return randomAttentionAudioFile
		.map((randomAttentionAudioFileValue) => {
			return `/audio/${randomAttentionAudioFileValue}`;
		})
		.unwrapOr("/audio/attention_1");
}

function findZeroGamePointsAudioFile(randomCollectionElement: typeof sample): string {
	const randomZeroPointsAudioFile = Maybe.of(randomCollectionElement(zeroPointsAudioFiles));

	return randomZeroPointsAudioFile
		.map((randomZeroPointsAudioFileValue) => {
			return `/audio/${randomZeroPointsAudioFileValue}`;
		})
		.unwrapOr("/audio/0_1");
}

export function createPlaylist(options: CreatePlaylistOptions): readonly string[] {
	const { teams, includeStretched, randomCollectionElement } = options;
	const playlist: string[] = [findAttentionAudioFile(randomCollectionElement)];

	let stretched = false;

	teams.forEach((team, index) => {
		const { isStretched, gamePoints } = team;

		if (includeStretched && isStretched) {
			stretched = true;
		}

		if (index === 1) {
			playlist.push("/audio/zu");
		}

		if (gamePoints === 0) {
			const zeroGamePointsAudioFile = findZeroGamePointsAudioFile(randomCollectionElement);

			playlist.push(zeroGamePointsAudioFile);
			return;
		}

		playlist.push(`/audio/${gamePoints}`);
	});

	if (stretched) {
		playlist.push("/audio/gspannt");
	}

	return playlist;
}
