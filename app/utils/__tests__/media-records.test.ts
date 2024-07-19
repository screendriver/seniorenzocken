import { test, expect, vi } from "vitest";
import Maybe from "true-myth/maybe";
import { Factory } from "fishery";
import type PocketBase from "pocketbase";

const pocketBaseFactory = Factory.define<PocketBase>(() => {
	return {
		collection: vi.fn().mockReturnValue({
			getList: vi.fn().mockResolvedValue({}),
		}),
		files: {
			getUrl: vi.fn().mockReturnValue("http://example.com/api/files/abc123/123abc/foo.m4a"),
		},
	} as unknown as PocketBase;
});

const mediaRecordFactory = Factory.define<MediaRecord>(() => {
	return {
		name: "test",
		fileName: ["foo.m4a"],
		collectionId: "abc123",
		id: "123abc",
		gamePoints: -1,
	};
});

const teamFactory = Factory.define<Team>(() => {
	return {
		teamNumber: 1,
		teamName: "",
		gamePoints: 0,
		isStretched: false,
	};
});

test("parseAllMediaRecords() fails when given media record is not valid", () => {
	const mediaRecords = [{}];

	expect(() => parseAllMediaRecords(mediaRecords)).toThrow();
});

test("parseAllMediaRecords() succeeds when given media records has all needed properties", () => {
	const mediaRecords = mediaRecordFactory.buildList(1);

	expect(parseAllMediaRecords(mediaRecords)).toStrictEqual(mediaRecords);
});

test("mediaRecordFinder.findAttentionMediaRecord() returns a Nothing when no media records exist", () => {
	const mediaRecordFinder = createMediaRecordFinder([]);

	expect(mediaRecordFinder.findAttentionMediaRecord()).toStrictEqual(Maybe.nothing());
});

test('mediaRecordFinder.findAttentionMediaRecord() returns a Nothing when no media record with the name "attention" could be found', () => {
	const mediaRecordFinder = createMediaRecordFinder(mediaRecordFactory.buildList(1, { name: "foo" }));

	expect(mediaRecordFinder.findAttentionMediaRecord()).toStrictEqual(Maybe.nothing());
});

test('mediaRecordFinder.findAttentionMediaRecord() returns a Just when a media record with the name "attention" could be found', () => {
	const attentionMediaRecord = mediaRecordFactory.build({ name: "attention" });
	const mediaRecordFinder = createMediaRecordFinder([
		mediaRecordFactory.build({ name: "foo" }),
		attentionMediaRecord,
	]);

	expect(mediaRecordFinder.findAttentionMediaRecord()).toStrictEqual(Maybe.just(attentionMediaRecord));
});

test("mediaRecordFinder.findGamePointMediaRecord() returns a Nothing when no media records exist", () => {
	const mediaRecordFinder = createMediaRecordFinder([]);

	expect(mediaRecordFinder.findGamePointMediaRecord(0)).toStrictEqual(Maybe.nothing());
});

test("mediaRecordFinder.findGamePointMediaRecord() returns a Nothing when no media record for the given game point could be found", () => {
	const mediaRecordFinder = createMediaRecordFinder(mediaRecordFactory.buildList(1, { name: "foo" }));

	expect(mediaRecordFinder.findGamePointMediaRecord(0)).toStrictEqual(Maybe.nothing());
});

test("mediaRecordFinder.findGamePointMediaRecord() returns a Just when a media record for the given game point could be found", () => {
	const zeroGamePointsMediaRecord = mediaRecordFactory.build({ gamePoints: 0 });
	const mediaRecordFinder = createMediaRecordFinder([
		mediaRecordFactory.build({ gamePoints: 4 }),
		zeroGamePointsMediaRecord,
	]);

	expect(mediaRecordFinder.findGamePointMediaRecord(0)).toStrictEqual(Maybe.just(zeroGamePointsMediaRecord));
});

test("mediaRecordFinder.findToMediaRecord() returns a Nothing when no media records exist", () => {
	const mediaRecordFinder = createMediaRecordFinder([]);

	expect(mediaRecordFinder.findToMediaRecord()).toStrictEqual(Maybe.nothing());
});

test('mediaRecordFinder.findToMediaRecord() returns a Nothing when no media record with the name "to" could be found', () => {
	const mediaRecordFinder = createMediaRecordFinder(mediaRecordFactory.buildList(1, { name: "foo" }));

	expect(mediaRecordFinder.findToMediaRecord()).toStrictEqual(Maybe.nothing());
});

test('mediaRecordFinder.findToMediaRecord() returns a Just when a media record with the name "to" could be found', () => {
	const toMediaRecord = mediaRecordFactory.build({ name: "to" });
	const mediaRecordFinder = createMediaRecordFinder([mediaRecordFactory.build({ name: "foo" }), toMediaRecord]);

	expect(mediaRecordFinder.findToMediaRecord()).toStrictEqual(Maybe.just(toMediaRecord));
});

test("mediaRecordFinder.findStretchedMediaRecord() returns a Nothing when no media records exist", () => {
	const team1 = ref(teamFactory.build({ isStretched: true }));
	const team2 = ref(teamFactory.build({ isStretched: false }));
	const mediaRecordFinder = createMediaRecordFinder([]);

	expect(mediaRecordFinder.findStretchedMediaRecord(team1, team2)).toStrictEqual(Maybe.nothing());
});

test('mediaRecordFinder.findStretchedMediaRecord() returns a Nothing when no media record with the name "stretched" could be found', () => {
	const team1 = ref(teamFactory.build({ isStretched: true }));
	const team2 = ref(teamFactory.build({ isStretched: false }));
	const mediaRecordFinder = createMediaRecordFinder(mediaRecordFactory.buildList(1, { name: "foo" }));

	expect(mediaRecordFinder.findStretchedMediaRecord(team1, team2)).toStrictEqual(Maybe.nothing());
});

test('mediaRecordFinder.findStretchedMediaRecord() returns a Just when team 1 is stretched and a media record with the name "stretched" could be found', () => {
	const team1 = ref(teamFactory.build({ isStretched: true }));
	const team2 = ref(teamFactory.build({ isStretched: false }));
	const stretchedMediaRecord = mediaRecordFactory.build({ name: "stretched" });
	const mediaRecordFinder = createMediaRecordFinder([
		mediaRecordFactory.build({ name: "foo" }),
		stretchedMediaRecord,
	]);

	expect(mediaRecordFinder.findStretchedMediaRecord(team1, team2)).toStrictEqual(Maybe.just(stretchedMediaRecord));
});

test('mediaRecordFinder.findStretchedMediaRecord() returns a Just when team 2 is stretched and a media record with the name "stretched" could be found', () => {
	const team1 = ref(teamFactory.build({ isStretched: false }));
	const team2 = ref(teamFactory.build({ isStretched: true }));
	const stretchedMediaRecord = mediaRecordFactory.build({ name: "stretched" });
	const mediaRecordFinder = createMediaRecordFinder([
		mediaRecordFactory.build({ name: "foo" }),
		stretchedMediaRecord,
	]);

	expect(mediaRecordFinder.findStretchedMediaRecord(team1, team2)).toStrictEqual(Maybe.just(stretchedMediaRecord));
});

test("mediaRecordFinder.findWonMediaRecord() returns a Nothing when no media records exist", () => {
	const mediaRecordFinder = createMediaRecordFinder([]);

	expect(mediaRecordFinder.findWonMediaRecord()).toStrictEqual(Maybe.nothing());
});

test('mediaRecordFinder.findWonMediaRecord() returns a Nothing when no media record with the name "won" could be found', () => {
	const mediaRecordFinder = createMediaRecordFinder(mediaRecordFactory.buildList(1, { name: "foo" }));

	expect(mediaRecordFinder.findWonMediaRecord()).toStrictEqual(Maybe.nothing());
});

test('mediaRecordFinder.findWonMediaRecord() returns a Just when a media record with the name "won" could be found', () => {
	const toMediaRecord = mediaRecordFactory.build({ name: "won" });
	const mediaRecordFinder = createMediaRecordFinder([mediaRecordFactory.build({ name: "foo" }), toMediaRecord]);

	expect(mediaRecordFinder.findWonMediaRecord()).toStrictEqual(Maybe.just(toMediaRecord));
});

test("getRandomMediaFileName() sets the media file name to a Nothing when given media record is also a Nothing", () => {
	const sample = vi.fn();
	const mediaRecord = Maybe.nothing<MediaRecord>();

	expect(getRandomMediaFileName(sample)(mediaRecord)).toStrictEqual(Maybe.nothing());
});

test("getRandomMediaFileName() sets the media file name to a Nothing when sample function returns undefined", () => {
	const sample = vi.fn().mockReturnValue(undefined);
	const mediaRecord = mediaRecordFactory.build({ fileName: ["foo"] });
	const mediaRecordMaybe = Maybe.just(mediaRecord);

	const randomMediaFile = getRandomMediaFileName(sample)(mediaRecordMaybe);
	const expected = Maybe.just<MediaRecordWithRandomFileName>({
		mediaRecord,
		randomMediaFileName: Maybe.nothing(),
	});

	expect(sample).toHaveBeenNthCalledWith(1, ["foo"]);
	expect(randomMediaFile).toStrictEqual(expected);
});

test("getRandomMediaFileName() sets the media file name to a Just when sample function returns a random file name", () => {
	const sample = vi.fn().mockReturnValue("bar");
	const mediaRecord = mediaRecordFactory.build({ fileName: ["foo", "bar"] });
	const mediaRecordMaybe = Maybe.just(mediaRecord);

	const randomMediaFile = getRandomMediaFileName(sample)(mediaRecordMaybe);
	const expected = Maybe.just<MediaRecordWithRandomFileName>({
		mediaRecord,
		randomMediaFileName: Maybe.just("bar"),
	});

	expect(sample).toHaveBeenNthCalledWith(1, ["foo", "bar"]);
	expect(randomMediaFile).toStrictEqual(expected);
});

test("buildAbsoluteMediaRecordUrl() returns a Nothing when given media record with random file name is also a Nothing", () => {
	const pocketBase = pocketBaseFactory.build();
	const mediaRecordWithRandomFileName = Maybe.nothing<MediaRecordWithRandomFileName>();

	expect(buildAbsoluteMediaRecordUrl(pocketBase)(mediaRecordWithRandomFileName)).toStrictEqual(Maybe.nothing());
});

test("buildAbsoluteMediaRecordUrl() returns a Nothing when given random media file name is also a Nothing", () => {
	const pocketBase = pocketBaseFactory.build();
	const mediaRecordWithRandomFileName = Maybe.just<MediaRecordWithRandomFileName>({
		mediaRecord: mediaRecordFactory.build(),
		randomMediaFileName: Maybe.nothing(),
	});
	const absoluteUrl = buildAbsoluteMediaRecordUrl(pocketBase)(mediaRecordWithRandomFileName);

	expect(absoluteUrl).toStrictEqual(Maybe.nothing());
});

test("buildAbsoluteMediaRecordUrl() returns a Just with the generated absolute URL to the media file", () => {
	const pocketBase = pocketBaseFactory.build();
	const mediaRecordWithRandomFileName = Maybe.just<MediaRecordWithRandomFileName>({
		mediaRecord: mediaRecordFactory.build(),
		randomMediaFileName: Maybe.just("foo.m4a"),
	});
	const absoluteUrl = buildAbsoluteMediaRecordUrl(pocketBase)(mediaRecordWithRandomFileName);

	expect(absoluteUrl).toStrictEqual(Maybe.just(new URL("http://example.com/api/files/abc123/123abc/foo.m4a")));
});
