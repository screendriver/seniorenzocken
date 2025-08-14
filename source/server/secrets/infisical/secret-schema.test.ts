import { describe, it, expect } from "vitest";
import { parse } from "valibot";
import { Factory } from "fishery";
import { secretSchema } from "./secret-schema.js";

const secretFactory = Factory.define(() => {
	return {
		secretValue: "test"
	};
});

describe("secretSchema", () => {
	it("fails parsing when given object is undefined", () => {
		expect(() => {
			return parse(secretSchema, undefined);
		}).toThrow();
	});

	it("fails parsing when given object is null", () => {
		expect(() => {
			return parse(secretSchema, null);
		}).toThrow();
	});

	it("fails parsing when given data is not an object", () => {
		expect(() => {
			return parse(secretSchema, "not-an-object");
		}).toThrow();
	});

	it("fails parsing when given object.secretValue is undefined", () => {
		const secret = secretFactory.build({ secretValue: undefined });

		expect(() => {
			return parse(secretSchema, secret);
		}).toThrow();
	});

	it("fails parsing when given object.secretValue is null", () => {
		const secret = secretFactory.build({ secretValue: null });

		expect(() => {
			return parse(secretSchema, secret);
		}).toThrow();
	});

	it("fails parsing when given object.secretValue is not a string", () => {
		const secret = secretFactory.build({ secretValue: 42 });

		expect(() => {
			return parse(secretSchema, secret);
		}).toThrow();
	});

	it("fails parsing when given object.secretValue is an empty string", () => {
		const secret = secretFactory.build({ secretValue: "" });

		expect(() => {
			return parse(secretSchema, secret);
		}).toThrow();
	});

	it("succeeds parsing when given object.secretValue is not an empty string", () => {
		const secret = secretFactory.build({ secretValue: "foo" });

		const parseResult = parse(secretSchema, secret);

		expect(parseResult).toStrictEqual({ secretValue: "foo" });
	});
});
