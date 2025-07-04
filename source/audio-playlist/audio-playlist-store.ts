import { ref, type Ref } from "vue";
import { defineStore } from "pinia";
import type PocketBase from "pocketbase";
import { isUndefined } from "@sindresorhus/is";
import Maybe, { first } from "true-myth/maybe";
import promisePipe from "p-pipe";
import lodashSample from "lodash.sample";
import flowRight from "lodash.flowright";
import { usePocketBase } from "../pocketbase/use-pocketbase.js";
import type { Team } from "../team/team.js";
import {
	buildAbsoluteMediaRecordUrl,
	createMediaRecordFinder,
	getRandomMediaFileName,
	parseAllMediaRecords,
} from "../media-record/media-records.js";

export const useAudioPlaylistStore = defineStore("audio-playlist", () => {
	const pocketBaseRef = ref<PocketBase>();
	const audioPlaylist = ref<URL[]>([]);
	const audioSourceUrl = ref<Maybe<URL>>(Maybe.nothing());

	function initialize(pocketBase: PocketBase): void {
		pocketBaseRef.value = pocketBase;
	}

	const { fetchAllMediaRecords } = usePocketBase(pocketBaseRef);

	async function generateAudioPlaylist(team1: Ref<Team>, team2: Ref<Team>, isGameOver: Ref<boolean>): Promise<void> {
		if (isUndefined(pocketBaseRef.value)) {
			throw new Error("PocketBase couldn't be injected");
		}

		const {
			findAttentionMediaRecord,
			findGamePointMediaRecord,
			findToMediaRecord,
			findStretchedMediaRecord,
			findWonMediaRecord,
		} = await promisePipe(fetchAllMediaRecords, parseAllMediaRecords, createMediaRecordFinder)();

		const buildAbsoluteUrlForMediaRecord = flowRight(
			buildAbsoluteMediaRecordUrl(pocketBaseRef.value),
			getRandomMediaFileName(lodashSample),
		);

		const attentionMediaRecordUrl = buildAbsoluteUrlForMediaRecord(findAttentionMediaRecord());
		const team1GamePointsMediaRecordUrl = buildAbsoluteUrlForMediaRecord(
			findGamePointMediaRecord(team1.value.gamePoints),
		);
		const toMediaRecordUrl = buildAbsoluteUrlForMediaRecord(findToMediaRecord());
		const team2GamePointsMediaRecordUrl = buildAbsoluteUrlForMediaRecord(
			findGamePointMediaRecord(team2.value.gamePoints),
		);
		const stretchedMediaRecordUrl = buildAbsoluteUrlForMediaRecord(findStretchedMediaRecord(team1, team2));

		const playlist: URL[] = [];

		if (attentionMediaRecordUrl.isJust) {
			playlist.push(attentionMediaRecordUrl.value);
		}

		if (team1GamePointsMediaRecordUrl.isJust) {
			playlist.push(team1GamePointsMediaRecordUrl.value);
		}

		if (toMediaRecordUrl.isJust) {
			playlist.push(toMediaRecordUrl.value);
		}

		if (team2GamePointsMediaRecordUrl.isJust) {
			playlist.push(team2GamePointsMediaRecordUrl.value);
		}

		if (!isGameOver.value && stretchedMediaRecordUrl.isJust) {
			playlist.push(stretchedMediaRecordUrl.value);
		}

		if (isGameOver.value) {
			const wonMediaRecordUrl = buildAbsoluteUrlForMediaRecord(findWonMediaRecord());

			if (wonMediaRecordUrl.isJust) {
				playlist.push(wonMediaRecordUrl.value);
			}
		}

		audioPlaylist.value = playlist;
		audioSourceUrl.value = first(playlist).map((playlistValue) => {
			return playlistValue.value;
		});
	}

	function nextAudioPlaylistItem(): Maybe<URL> {
		audioPlaylist.value.shift();

		const nextPlaylistItem = first(audioPlaylist.value);
		audioSourceUrl.value = nextPlaylistItem.map((nextPlaylistItemValue) => {
			return nextPlaylistItemValue.value;
		});

		return nextPlaylistItem.map((nextPlaylistItemValue) => {
			return nextPlaylistItemValue.value;
		});
	}

	return { initialize, audioPlaylist, audioSourceUrl, generateAudioPlaylist, nextAudioPlaylistItem };
});

export type AudioPlaylistStore = ReturnType<typeof useAudioPlaylistStore>;
