import { describe, it, expect, assert } from "vitest";
import { safeParse } from "valibot";
import { Factory } from "fishery";
import { authenticationSchema } from "./authentication-schema.js";

const authenticationFactory = Factory.define(() => {
	return {
		username: "test-username",
		password: "test-password"
	};
});

describe("authenticationSchema", () => {
	it("fails parsing when given data is undefined", () => {
		const parseResult = safeParse(authenticationSchema, undefined);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is null", () => {
		const parseResult = safeParse(authenticationSchema, null);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is not an object", () => {
		const parseResult = safeParse(authenticationSchema, "not-an-object");

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is an empty object", () => {
		const parseResult = safeParse(authenticationSchema, {});

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.username is undefined", () => {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ username: undefined }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.username is null", () => {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ username: null }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.username is an empty string", () => {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ username: "" }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.username is not a string", () => {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ username: 42 }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.password is undefined", () => {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ password: undefined }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.password is null", () => {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ password: null }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.password is an empty string", () => {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ password: "" }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.password is not a string", () => {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ password: 42 }));

		expect(parseResult.success).toBe(false);
	});

	it("succeeds parsing when given object contains a valid username and password", () => {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build());

		assert(parseResult.success);

		expect(parseResult.output).toStrictEqual({
			username: "test-username",
			password: "test-password"
		});
	});
});
