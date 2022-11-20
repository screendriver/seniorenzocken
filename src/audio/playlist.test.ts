import { Factory } from "fishery";
import { test, assert, vi, type TestFunction } from "vitest";
import type { Team } from "../team/team-schema.js";
import { createPlaylist } from "./playlist.js";

const teamFactory = Factory.define<Team>(() => {
	return {
		teamName: "",
		gamePoints: 0,
		isStretched: false
	};
});

interface TestRandomCollectionElementOptions {
	readonly zeroPointsAudioFilesIndex: number;
	readonly expectedPlaylist: readonly string[];
}

function testRandomCollectionElement(options: TestRandomCollectionElementOptions): TestFunction {
	const { zeroPointsAudioFilesIndex, expectedPlaylist } = options;

	return () => {
		const teams = new Map([
			[1, teamFactory.build()],
			[2, teamFactory.build()]
		]);
		const randomCollectionElement = vi.fn<[string[]]>((zeroPointsAudioFiles) => {
			return zeroPointsAudioFiles[zeroPointsAudioFilesIndex];
		});
		const playlist = createPlaylist(teams, randomCollectionElement);

		assert.deepStrictEqual(playlist, expectedPlaylist);
	};
}

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the first found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 0,
		expectedPlaylist: ["/audio/0_1.webm", "/audio/zu.webm", "/audio/0_1.webm"]
	})
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the second found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 1,
		expectedPlaylist: ["/audio/0_2.webm", "/audio/zu.webm", "/audio/0_2.webm"]
	})
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the third found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 2,
		expectedPlaylist: ["/audio/0_3.webm", "/audio/zu.webm", "/audio/0_3.webm"]
	})
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the fourth found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 3,
		expectedPlaylist: ["/audio/0_4.webm", "/audio/zu.webm", "/audio/0_4.webm"]
	})
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the fifth found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 4,
		expectedPlaylist: ["/audio/0_5.webm", "/audio/zu.webm", "/audio/0_5.webm"]
	})
);

test(
	"createPlaylist() calls given randomCollectionElement() function and returns the sixth found audio file",
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 5,
		expectedPlaylist: ["/audio/0_6.webm", "/audio/zu.webm", "/audio/0_6.webm"]
	})
);

test(
	'createPlaylist() calls given randomCollectionElement() function and returns "0_1" as fallback when index is out of bounds',
	testRandomCollectionElement({
		zeroPointsAudioFilesIndex: 6,
		expectedPlaylist: ["/audio/0_1.webm", "/audio/zu.webm", "/audio/0_1.webm"]
	})
);

test("createPlaylist() returns 3 paths when no team is stretched and sets the correct paths", () => {
	const teams = new Map([
		[1, teamFactory.build()],
		[
			2,
			teamFactory.build({
				gamePoints: 3
			})
		]
	]);
	const randomCollectionElement = vi.fn<[string[]]>((zeroPointsAudioFiles) => {
		return zeroPointsAudioFiles[0];
	});
	const playlist = createPlaylist(teams, randomCollectionElement);

	assert.deepStrictEqual(playlist, ["/audio/0_1.webm", "/audio/zu.webm", "/audio/3.webm"]);
});

test("createPlaylist() appends an audio file at the end when the first team is stretched", () => {
	const teams = new Map([
		[1, teamFactory.build({ isStretched: true })],
		[2, teamFactory.build()]
	]);
	const randomCollectionElement = vi.fn<[string[]]>((zeroPointsAudioFiles) => {
		return zeroPointsAudioFiles[0];
	});
	const playlist = createPlaylist(teams, randomCollectionElement);

	assert.deepStrictEqual(playlist, ["/audio/0_1.webm", "/audio/zu.webm", "/audio/0_1.webm", "/audio/gspannt.webm"]);
});

test("createPlaylist() appends an audio file at the end when the second team is stretched", () => {
	const teams = new Map([
		[1, teamFactory.build()],
		[
			2,
			teamFactory.build({
				isStretched: true
			})
		]
	]);
	const randomCollectionElement = vi.fn<[string[]]>((zeroPointsAudioFiles) => {
		return zeroPointsAudioFiles[0];
	});
	const playlist = createPlaylist(teams, randomCollectionElement);

	assert.deepStrictEqual(playlist, ["/audio/0_1.webm", "/audio/zu.webm", "/audio/0_1.webm", "/audio/gspannt.webm"]);
});

test("createPlaylist() appends an audio file at the end when both teams are stretched", () => {
	const teams = new Map([
		[1, teamFactory.build({ isStretched: true })],
		[
			2,
			teamFactory.build({
				isStretched: true
			})
		]
	]);
	const randomCollectionElement = vi.fn<[string[]]>((zeroPointsAudioFiles) => {
		return zeroPointsAudioFiles[0];
	});
	const playlist = createPlaylist(teams, randomCollectionElement);

	assert.deepStrictEqual(playlist, ["/audio/0_1.webm", "/audio/zu.webm", "/audio/0_1.webm", "/audio/gspannt.webm"]);
});
