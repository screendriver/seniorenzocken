import is from "@sindresorhus/is";
import type sample from "lodash.sample";
import type { Teams } from "../team/team-schema.js";

const zeroPointsAudioFiles = ["0_1", "0_2", "0_3", "0_4", "0_5", "0_6"];

export function createPlaylist(
	teams: Teams,
	includeStretched: boolean,
	randomCollectionElement: typeof sample
): readonly string[] {
	const playlist: string[] = [];

	let stretched = false;

	teams.forEach((team, index) => {
		const { isStretched, gamePoints } = team;
		if (isStretched) {
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

	if (includeStretched && stretched) {
		playlist.push("/audio/gspannt");
	}

	return playlist;
}
