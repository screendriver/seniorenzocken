import assert from "node:assert";
import { suite, test } from "mocha";
import { safeParse } from "valibot";
import { Factory } from "fishery";
import { authenticationSchema } from "./authentication-schema.js";

const authenticationFactory = Factory.define(() => {
	return {
		username: "test-username",
		password: "test-password"
	};
});

suite("authenticationSchema", function () {
	test("fails parsing when given data is undefined", function () {
		const parseResult = safeParse(authenticationSchema, undefined);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is null", function () {
		const parseResult = safeParse(authenticationSchema, null);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is not an object", function () {
		const parseResult = safeParse(authenticationSchema, "not-an-object");

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is an empty object", function () {
		const parseResult = safeParse(authenticationSchema, {});

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.username is undefined", function () {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ username: undefined }));

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.username is null", function () {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ username: null }));

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.username is an empty string", function () {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ username: "" }));

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.username is not a string", function () {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ username: 42 }));

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.password is undefined", function () {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ password: undefined }));

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.password is null", function () {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ password: null }));

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.password is an empty string", function () {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ password: "" }));

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.password is not a string", function () {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build({ password: 42 }));

		assert.strictEqual(parseResult.success, false);
	});

	test("succeeds parsing when given object contains a valid username and password", function () {
		const parseResult = safeParse(authenticationSchema, authenticationFactory.build());

		assert.ok(parseResult.success);

		assert.deepStrictEqual(parseResult.output, {
			username: "test-username",
			password: "test-password"
		});
	});
});
