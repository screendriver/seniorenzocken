import { test, expect } from "vitest";
import * as v from "valibot";
import { Factory } from "fishery";

const mediaRecordFactory = Factory.define(() => {
	return {
		name: "-",
		path: ["-"],
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

test("mediaRecordSchema parsing fails when given object.path is undefined", () => {
	const mediaRecord = mediaRecordFactory.build({ path: undefined });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.path is null", () => {
	const mediaRecord = mediaRecordFactory.build({ path: null });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.path is an empty Array", () => {
	const mediaRecord = mediaRecordFactory.build({ path: [] });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing fails when given object.path is an Array with empty strings", () => {
	const mediaRecord = mediaRecordFactory.build({ path: [""] });
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordSchema parsing succeeds when all required fields exist", () => {
	const mediaRecord = mediaRecordFactory.build();
	const parseResult = v.safeParse(mediaRecordSchema, mediaRecord);

	expect(parseResult.success).toBe(true);
});

test("mediaRecordsSchema parsing fails when given object is undefined", () => {
	const parseResult = v.safeParse(mediaRecordsSchema, undefined);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordsSchema parsing fails when given object is null", () => {
	const parseResult = v.safeParse(mediaRecordsSchema, null);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordsSchema parsing fails when given object is not an Array", () => {
	const parseResult = v.safeParse(mediaRecordsSchema, "not-an-array");

	expect(parseResult.success).toBe(false);
});

test("mediaRecordsSchema parsing fails when given object is an empty Array", () => {
	const parseResult = v.safeParse(mediaRecordsSchema, []);

	expect(parseResult.success).toBe(false);
});

test("mediaRecordsSchema parsing succeeds when given object is an Array with media records", () => {
	const parseResult = v.safeParse(mediaRecordsSchema, mediaRecordFactory.buildList(1));

	expect(parseResult.success).toBe(true);
});
