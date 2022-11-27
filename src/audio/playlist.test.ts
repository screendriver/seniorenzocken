import { Factory } from "fishery";
import { test, assert, vi, type TestFunction } from "vitest";
import type { Team } from "../team/team-schema.js";
import { createPlaylist, type CreatePlaylistOptions } from "./playlist.js";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0,
		isStretched: false
	};
});

interface CreatePlaylistOptionsTransientParameters {
	readonly zeroPointsAudioFilesIndex: number;
}

const createPlaylistOptionsFactory = Factory.define<CreatePlaylistOptions, CreatePlaylistOptionsTransientParameters>(
	({ transientParams }) => {
		const { zeroPointsAudioFilesIndex = 0 } = transientParams;

		return {
			teams: new Map([
				[1, teamFactory.build()],
				[2, teamFactory.build()]
			]),
			includeStretched: false,
			randomCollectionElement: vi.fn<[string[]]>((zeroPointsAudioFiles) => {
				return zeroPointsAudioFiles[zeroPointsAudioFilesIndex];
			})
		};
	}
);

interface TestRandomCollectionElementOptions {
	readonly zeroPointsAudioFilesIndex: number;
	readonly expectedPlaylist: readonly string[];
}

function testRandomCollectionElement(options: TestRandomCollectionElementOptions): TestFunction {
	const { zeroPointsAudioFilesIndex, expectedPlaylist } = options;

	return () => {
		const options = createPlaylistOptionsFactory.build(undefined, { transient: { zeroPointsAudioFilesIndex } });
		const playlist = createPlaylist(options);

		assert.deepStrictEqual(playlist, expectedPlaylist);
	};
}

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the first found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 0,
		expectedPlaylist: ["/audio/0_1", "/audio/zu", "/audio/0_1"]
	})
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the second found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 1,
		expectedPlaylist: ["/audio/0_2", "/audio/zu", "/audio/0_2"]
	})
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the third found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 2,
		expectedPlaylist: ["/audio/0_3", "/audio/zu", "/audio/0_3"]
	})
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the fourth found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 3,
		expectedPlaylist: ["/audio/0_4", "/audio/zu", "/audio/0_4"]
	})
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the fifth found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 4,
		expectedPlaylist: ["/audio/0_5", "/audio/zu", "/audio/0_5"]
	})
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the sixth found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 5,
		expectedPlaylist: ["/audio/0_6", "/audio/zu", "/audio/0_6"]
	})
);

test(
	'createPlaylist() calls given randomCollectionElement() function and returns "0_1" as fallback when index is out of bounds',
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 6,
		expectedPlaylist: ["/audio/0_1", "/audio/zu", "/audio/0_1"]
	})
);

test("createPlaylist() returns 3 paths when no team is stretched and sets the correct paths", () => {
	const options = createPlaylistOptionsFactory.build({
		teams: new Map([
			[1, teamFactory.build()],
			[
				2,
				teamFactory.build({
					gamePoints: 3
				})
			]
		]),
		includeStretched: true
	});
	const playlist = createPlaylist(options);

	assert.deepStrictEqual(playlist, ["/audio/0_1", "/audio/zu", "/audio/3"]);
});

test("createPlaylist() appends an audio file at the end when the first team is stretched and stretched should be included", () => {
	const options = createPlaylistOptionsFactory.build({
		teams: new Map([
			[1, teamFactory.build({ isStretched: true })],
			[2, teamFactory.build()]
		]),
		includeStretched: true
	});
	const playlist = createPlaylist(options);

	assert.deepStrictEqual(playlist, ["/audio/0_1", "/audio/zu", "/audio/0_1", "/audio/gspannt"]);
});

test("createPlaylist() does not append an audio file at the end when the first team is stretched and stretched should not be included", () => {
	const options = createPlaylistOptionsFactory.build({
		teams: new Map([
			[1, teamFactory.build({ isStretched: true })],
			[2, teamFactory.build()]
		])
	});
	const playlist = createPlaylist(options);

	assert.deepStrictEqual(playlist, ["/audio/0_1", "/audio/zu", "/audio/0_1"]);
});

test("createPlaylist() appends an audio file at the end when the second team is stretched and stretched should be included", () => {
	const options = createPlaylistOptionsFactory.build({
		teams: new Map([
			[1, teamFactory.build()],
			[
				2,
				teamFactory.build({
					isStretched: true
				})
			]
		]),
		includeStretched: true
	});
	const playlist = createPlaylist(options);

	assert.deepStrictEqual(playlist, ["/audio/0_1", "/audio/zu", "/audio/0_1", "/audio/gspannt"]);
});

test("createPlaylist() does not append an audio file at the end when the second team is stretched and stretched should not be included", () => {
	const options = createPlaylistOptionsFactory.build({
		teams: new Map([
			[1, teamFactory.build()],
			[
				2,
				teamFactory.build({
					isStretched: true
				})
			]
		])
	});
	const playlist = createPlaylist(options);

	assert.deepStrictEqual(playlist, ["/audio/0_1", "/audio/zu", "/audio/0_1"]);
});

test("createPlaylist() appends an audio file at the end when both teams are stretched and stretched should be included", () => {
	const options = createPlaylistOptionsFactory.build({
		teams: new Map([
			[1, teamFactory.build({ isStretched: true })],
			[
				2,
				teamFactory.build({
					isStretched: true
				})
			]
		]),
		includeStretched: true
	});
	const playlist = createPlaylist(options);

	assert.deepStrictEqual(playlist, ["/audio/0_1", "/audio/zu", "/audio/0_1", "/audio/gspannt"]);
});

test("createPlaylist() does not append an audio file at the end when both teams are stretched and stretched should not be included", () => {
	const options = createPlaylistOptionsFactory.build({
		teams: new Map([
			[1, teamFactory.build({ isStretched: true })],
			[
				2,
				teamFactory.build({
					isStretched: true
				})
			]
		])
	});
	const playlist = createPlaylist(options);

	assert.deepStrictEqual(playlist, ["/audio/0_1", "/audio/zu", "/audio/0_1"]);
});
