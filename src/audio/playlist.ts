import is from "@sindresorhus/is";
import type sample from "lodash.sample";
import type { Teams } from "../team/team-schema.js";

const zeroPointsAudioFiles = ["0_1", "0_2", "0_3", "0_4", "0_5", "0_6"];

export interface CreatePlaylistOptions {
	readonly teams: Teams;
	readonly includeStretched: boolean;
	readonly randomCollectionElement: typeof sample;
}

export function createPlaylist(options: CreatePlaylistOptions): readonly string[] {
	const { teams, includeStretched, randomCollectionElement } = options;
	const playlist: string[] = [];

	let stretched = false;

	teams.forEach((team, index) => {
		const { isStretched, gamePoints } = team;

		if (includeStretched && isStretched) {
			stretched = true;
		}

		if (index === 2) {
			playlist.push("/audio/zu");
		}

		if (gamePoints === 0) {
			const randomZeroPointsAudioFile = randomCollectionElement(zeroPointsAudioFiles);

			if (is.undefined(randomZeroPointsAudioFile)) {
				playlist.push(`/audio/0_1`);
			} else {
				playlist.push(`/audio/${randomZeroPointsAudioFile}`);
			}

			return;
		}

		playlist.push(`/audio/${gamePoints}`);
	});

	if (stretched) {
		playlist.push("/audio/gspannt");
	}

	return playlist;
}
