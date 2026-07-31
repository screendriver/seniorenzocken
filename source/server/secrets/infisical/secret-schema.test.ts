import assert from "node:assert";
import { suite, test } from "mocha";
import { parse } from "valibot";
import { Factory } from "fishery";
import { secretSchema } from "./secret-schema.js";

const secretFactory = Factory.define(() => {
	return {
		secretValue: "test"
	};
});

suite("secretSchema", function () {
	test("fails parsing when given object is undefined", function () {
		assert.throws(() => {
			return parse(secretSchema, undefined);
		});
	});

	test("fails parsing when given object is null", function () {
		assert.throws(() => {
			return parse(secretSchema, null);
		});
	});

	test("fails parsing when given data is not an object", function () {
		assert.throws(() => {
			return parse(secretSchema, "not-an-object");
		});
	});

	test("fails parsing when given object.secretValue is undefined", function () {
		const secret = secretFactory.build({ secretValue: undefined });

		assert.throws(() => {
			return parse(secretSchema, secret);
		});
	});

	test("fails parsing when given object.secretValue is null", function () {
		const secret = secretFactory.build({ secretValue: null });

		assert.throws(() => {
			return parse(secretSchema, secret);
		});
	});

	test("fails parsing when given object.secretValue is not a string", function () {
		const secret = secretFactory.build({ secretValue: 42 });

		assert.throws(() => {
			return parse(secretSchema, secret);
		});
	});

	test("fails parsing when given object.secretValue is an empty string", function () {
		const secret = secretFactory.build({ secretValue: "" });

		assert.throws(() => {
			return parse(secretSchema, secret);
		});
	});

	test("succeeds parsing when given object.secretValue is not an empty string", function () {
		const secret = secretFactory.build({ secretValue: "foo" });

		const parseResult = parse(secretSchema, secret);

		assert.deepStrictEqual(parseResult, { secretValue: "foo" });
	});
});
