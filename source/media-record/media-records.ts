import type PocketBase from "pocketbase";
import type { Ref } from "vue";
import * as v from "valibot";
import Maybe, { find } from "true-myth/maybe";
import type lodashSample from "lodash.sample";
import { allMediaRecordsSchema, type AllMediaRecords, type MediaRecord } from "./media-record-schema";
import type { GamePoints } from "../game-points/game-points";
import type { Team } from "../team/team";

export type MediaRecordWithRandomFileName = {
	readonly mediaRecord: MediaRecord;
	readonly randomMediaFileName: Maybe<string>;
};

export function parseAllMediaRecords(mediaRecords: unknown): AllMediaRecords {
	return v.parse(allMediaRecordsSchema, mediaRecords);
}

export type MediaRecordFinder = {
	readonly findAttentionMediaRecord: () => Maybe<MediaRecord>;
	readonly findGamePointMediaRecord: (gamePoints: GamePoints) => Maybe<MediaRecord>;
	readonly findToMediaRecord: () => Maybe<MediaRecord>;
	readonly findStretchedMediaRecord: (team1: Ref<Team>, team2: Ref<Team>) => Maybe<MediaRecord>;
	readonly findWonMediaRecord: () => Maybe<MediaRecord>;
};

export function createMediaRecordFinder(allMediaRecords: AllMediaRecords): MediaRecordFinder {
	return {
		findAttentionMediaRecord: () => {
			return find((mediaRecord) => {
				return mediaRecord.name === "attention";
			}, allMediaRecords);
		},

		findGamePointMediaRecord: (gamePoints: GamePoints) => {
			return find((mediaRecord) => {
				return mediaRecord.gamePoints === gamePoints;
			}, allMediaRecords);
		},

		findToMediaRecord: () => {
			return find((mediaRecord) => {
				return mediaRecord.name === "to";
			}, allMediaRecords);
		},

		findStretchedMediaRecord: (team1, team2) => {
			if (team1.value.isStretched || team2.value.isStretched) {
				return find((mediaRecord) => {
					return mediaRecord.name === "stretched";
				}, allMediaRecords);
			}

			return Maybe.nothing();
		},

		findWonMediaRecord: () => {
			return find((mediaRecord) => {
				return mediaRecord.name === "won";
			}, allMediaRecords);
		},
	};
}

export function getRandomMediaFileName(sample: typeof lodashSample) {
	return (mediaRecord: Maybe<MediaRecord>): Maybe<MediaRecordWithRandomFileName> => {
		return mediaRecord.map((mediaRecordValue) => {
			return {
				mediaRecord: mediaRecordValue,
				randomMediaFileName: Maybe.of(sample(mediaRecordValue.fileName)),
			};
		});
	};
}

export function buildAbsoluteMediaRecordUrl(pocketBase: PocketBase) {
	return (mediaRecordWithRandomFileName: Maybe<MediaRecordWithRandomFileName>): Maybe<URL> => {
		return mediaRecordWithRandomFileName.andThen((mediaRecordWithRandomFileNameValue) => {
			const { mediaRecord, randomMediaFileName } = mediaRecordWithRandomFileNameValue;

			return randomMediaFileName.map((randomMediaFileNameValue) => {
				const absoluteUrl = pocketBase.files.getURL(mediaRecord, randomMediaFileNameValue);

				return new URL(absoluteUrl);
			});
		});
	};
}
