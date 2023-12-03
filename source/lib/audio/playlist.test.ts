import test from "ava";
import { fake } from "sinon";
import { Factory } from "fishery";
import { createPlaylist, type CreatePlaylistOptions } from "./playlist.js";
import { teamFactory } from "../../../test/team-factory.js";

type CreatePlaylistOptionsTransientParameters = {
	readonly zeroPointsAudioFilesIndex: number;
};

const createPlaylistOptionsFactory = Factory.define<CreatePlaylistOptions, CreatePlaylistOptionsTransientParameters>(
	({ transientParams }) => {
		const { zeroPointsAudioFilesIndex = 0 } = transientParams;

		return {
			teams: [teamFactory.build(), teamFactory.build()],
			includeStretched: false,
			randomCollectionElement: fake<[string[]]>((zeroPointsAudioFiles) => {
				return zeroPointsAudioFiles[zeroPointsAudioFilesIndex];
			}),
		};
	},
);

const testRandomCollectionElementMacro = test.macro<[number, string[]]>(
	(t, zeroPointsAudioFilesIndex, expectedPlaylist) => {
		const options = createPlaylistOptionsFactory.build(undefined, { transient: { zeroPointsAudioFilesIndex } });
		const playlist = createPlaylist(options);

		t.deepEqual(playlist, expectedPlaylist);
	},
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the first found attention and audio files",
	testRandomCollectionElementMacro,
	0,
	["/audio/attention_1", "/audio/0_1", "/audio/zu", "/audio/0_1"],
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the second found attention and audio files",
	testRandomCollectionElementMacro,
	1,
	["/audio/attention_2", "/audio/0_2", "/audio/zu", "/audio/0_2"],
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the third found attention and audio files",
	testRandomCollectionElementMacro,
	2,
	["/audio/attention_3", "/audio/0_3", "/audio/zu", "/audio/0_3"],
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the fourth found attention and audio files",
	testRandomCollectionElementMacro,
	3,
	["/audio/attention_4", "/audio/0_4", "/audio/zu", "/audio/0_4"],
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the first attention but fifth found audio file",
	testRandomCollectionElementMacro,
	4,
	["/audio/attention_1", "/audio/0_5", "/audio/zu", "/audio/0_5"],
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the first attention but sixth found audio file",
	testRandomCollectionElementMacro,
	5,
	["/audio/attention_1", "/audio/0_6", "/audio/zu", "/audio/0_6"],
);

test(
	'createPlaylist() calls given randomCollectionElement() function and returns "0_1" as fallback when index is out of bounds',
	testRandomCollectionElementMacro,
	6,
	["/audio/attention_1", "/audio/0_1", "/audio/zu", "/audio/0_1"],
);

test("createPlaylist() returns 3 paths when no team is stretched and sets the correct paths", (t) => {
	const options = createPlaylistOptionsFactory.build({
		teams: [
			teamFactory.build(),
			teamFactory.build({
				totalGamePoints: 3,
			}),
		],
		includeStretched: true,
	});
	const playlist = createPlaylist(options);

	t.deepEqual(playlist, ["/audio/attention_1", "/audio/0_1", "/audio/zu", "/audio/3"]);
});

test("createPlaylist() appends an audio file at the end when the first team is stretched and stretched should be included", (t) => {
	const options = createPlaylistOptionsFactory.build({
		teams: [teamFactory.build({ isStretched: true }), teamFactory.build()],
		includeStretched: true,
	});
	const playlist = createPlaylist(options);

	t.deepEqual(playlist, ["/audio/attention_1", "/audio/0_1", "/audio/zu", "/audio/0_1", "/audio/gspannt"]);
});

test("createPlaylist() does not append an audio file at the end when the first team is stretched and stretched should not be included", (t) => {
	const options = createPlaylistOptionsFactory.build({
		teams: [teamFactory.build({ isStretched: true }), teamFactory.build()],
	});
	const playlist = createPlaylist(options);

	t.deepEqual(playlist, ["/audio/attention_1", "/audio/0_1", "/audio/zu", "/audio/0_1"]);
});

test("createPlaylist() appends an audio file at the end when the second team is stretched and stretched should be included", (t) => {
	const options = createPlaylistOptionsFactory.build({
		teams: [
			teamFactory.build(),
			teamFactory.build({
				isStretched: true,
			}),
		],
		includeStretched: true,
	});
	const playlist = createPlaylist(options);

	t.deepEqual(playlist, ["/audio/attention_1", "/audio/0_1", "/audio/zu", "/audio/0_1", "/audio/gspannt"]);
});

test("createPlaylist() does not append an audio file at the end when the second team is stretched and stretched should not be included", (t) => {
	const options = createPlaylistOptionsFactory.build({
		teams: [
			teamFactory.build(),
			teamFactory.build({
				isStretched: true,
			}),
		],
	});
	const playlist = createPlaylist(options);

	t.deepEqual(playlist, ["/audio/attention_1", "/audio/0_1", "/audio/zu", "/audio/0_1"]);
});

test("createPlaylist() appends an audio file at the end when both teams are stretched and stretched should be included", (t) => {
	const options = createPlaylistOptionsFactory.build({
		teams: [
			teamFactory.build({ isStretched: true }),
			teamFactory.build({
				isStretched: true,
			}),
		],
		includeStretched: true,
	});
	const playlist = createPlaylist(options);

	t.deepEqual(playlist, ["/audio/attention_1", "/audio/0_1", "/audio/zu", "/audio/0_1", "/audio/gspannt"]);
});

test("createPlaylist() does not append an audio file at the end when both teams are stretched and stretched should not be included", (t) => {
	const options = createPlaylistOptionsFactory.build({
		teams: [teamFactory.build({ isStretched: true }), teamFactory.build({ isStretched: true })],
	});
	const playlist = createPlaylist(options);

	t.deepEqual(playlist, ["/audio/attention_1", "/audio/0_1", "/audio/zu", "/audio/0_1"]);
});
