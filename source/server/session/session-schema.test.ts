import { describe, it, expect, assert } from "vitest";
import { safeParse } from "valibot";
import { Factory } from "fishery";
import { sessionSchema } from "./session-schema.js";

const sessionFactory = Factory.define(() => {
	return {
		token: "test-token"
	};
});

describe("sessionSchema", () => {
	it("fails parsing when given data is undefined", () => {
		const parseResult = safeParse(sessionSchema, undefined);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is null", () => {
		const parseResult = safeParse(sessionSchema, null);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is not an object", () => {
		const parseResult = safeParse(sessionSchema, "not-an-object");

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is an empty object", () => {
		const parseResult = safeParse(sessionSchema, {});

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.token is undefined", () => {
		const parseResult = safeParse(sessionSchema, sessionFactory.build({ token: undefined }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.token is null", () => {
		const parseResult = safeParse(sessionSchema, sessionFactory.build({ token: null }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.token is an empty string", () => {
		const parseResult = safeParse(sessionSchema, sessionFactory.build({ token: "" }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.token is not a string", () => {
		const parseResult = safeParse(sessionSchema, sessionFactory.build({ token: 42 }));

		expect(parseResult.success).toBe(false);
	});

	it("succeeds parsing when given object.token is not an empty string", () => {
		const parseResult = safeParse(sessionSchema, sessionFactory.build({ token: "test-token" }));

		assert(parseResult.success);

		expect(parseResult.output).toStrictEqual({ token: "test-token" });
	});
});
