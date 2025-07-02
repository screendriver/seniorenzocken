import { test, expect } from "vitest";
import * as v from "valibot";
import { Factory } from "fishery";
import { allMediaRecordsSchema, mediaRecordSchema } from "../media-record-schema.js";

const mediaRecordFactory = Factory.define(() => {
	return {
		collectionId: "collection-id",
		fileName: ["file.m4a"],
		id: "the-id",
		name: "test",
		gamePoints: 0,
	};
});

test("mediaRecordSchema parsing fails when given object is undefined", () => {
	const parseResult = v.safeParse(mediaRecordSchema, undefined);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object is null", () => {
	const parseResult = v.safeParse(mediaRecordSchema, null);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object is not an object", () => {
	const parseResult = v.safeParse(mediaRecordSchema, "not-an-object");

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.collectionId is undefined", () => {
	const mediaRecord = mediaRecordFactory.build({ collectionId: undefined });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.collectionId is null", () => {
	const mediaRecord = mediaRecordFactory.build({ collectionId: null });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.collectionId is not a string", () => {
	const mediaRecord = mediaRecordFactory.build({ collectionId: 42 });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.fileName is undefined", () => {
	const mediaRecord = mediaRecordFactory.build({ fileName: undefined });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.fileName is null", () => {
	const mediaRecord = mediaRecordFactory.build({ fileName: null });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.fileName is an empty Array", () => {
	const mediaRecord = mediaRecordFactory.build({ fileName: [] });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.fileName is an Array with empty strings", () => {
	const mediaRecord = mediaRecordFactory.build({ fileName: [""] });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.id is undefined", () => {
	const mediaRecord = mediaRecordFactory.build({ id: undefined });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.id is null", () => {
	const mediaRecord = mediaRecordFactory.build({ id: null });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.id is not a string", () => {
	const mediaRecord = mediaRecordFactory.build({ id: 42 });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.name is undefined", () => {
	const mediaRecord = mediaRecordFactory.build({ name: undefined });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.name is null", () => {
	const mediaRecord = mediaRecordFactory.build({ name: null });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.name is not a string", () => {
	const mediaRecord = mediaRecordFactory.build({ name: 42 });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.gamePoints is undefined", () => {
	const mediaRecord = mediaRecordFactory.build({ gamePoints: undefined });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.gamePoints is null", () => {
	const mediaRecord = mediaRecordFactory.build({ gamePoints: null });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.gamePoints is not a number", () => {
	const mediaRecord = mediaRecordFactory.build({ gamePoints: "not-a-number" });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing succeeds when all required fields exist", () => {
	const mediaRecord = mediaRecordFactory.build();
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(true);
});

test("allMediaRecordsSchema parsing fails when given object is undefined", () => {
	const parseResult = v.safeParse(allMediaRecordsSchema, undefined);

	expect(parseResult.success).toBe(false);
});

test("allMediaRecordsSchema parsing fails when given object is null", () => {
	const parseResult = v.safeParse(allMediaRecordsSchema, null);

	expect(parseResult.success).toBe(false);
});

test("allMediaRecordsSchema parsing fails when given object is not an Array", () => {
	const parseResult = v.safeParse(allMediaRecordsSchema, "not-an-array");

	expect(parseResult.success).toBe(false);
});

test("allMediaRecordsSchema parsing succeeds when given object is an empty Array", () => {
	const parseResult = v.safeParse(allMediaRecordsSchema, []);

	expect(parseResult.success).toBe(true);
});

test("allMediaRecordsSchema parsing succeeds when given object is an Array with media records", () => {
	const parseResult = v.safeParse(allMediaRecordsSchema, mediaRecordFactory.buildList(1));

	expect(parseResult.success).toBe(true);
});
