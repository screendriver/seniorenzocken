import { describe, it, expect, assert } from "vitest";
import { safeParse } from "valibot";
import { Factory } from "fishery";
import { currentGameRoundSessionsSchema, sessionSchema, type CurrentGameRoundSessions } from "./session-schema.js";

const sessionFactory = Factory.define(() => {
	return {
		token: "test-token"
	};
});

const currentGameRoundSessionFactory = Factory.define(() => {
	return {
		playerNickname: "test-nickname",
		playerFirstName: "test-first-name",
		teamId: 1
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

describe("currentGameRoundSessionsSchema", () => {
	it("fails parsing when given data is undefined", () => {
		const parseResult = safeParse(currentGameRoundSessionsSchema, undefined);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is null", () => {
		const parseResult = safeParse(currentGameRoundSessionsSchema, null);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is not an array", () => {
		const parseResult = safeParse(currentGameRoundSessionsSchema, "not-an-array");

		expect(parseResult.success).toBe(false);
	});

	it.each([{ listLength: 0 }, { listLength: 1 }, { listLength: 2 }, { listLength: 3 }])(
		"fails parsing when given array has only $listLength element(s)",
		(input) => {
			const parseResult = safeParse(
				currentGameRoundSessionsSchema,
				currentGameRoundSessionFactory.buildList(input.listLength)
			);

			expect(parseResult.success).toBe(false);
		}
	);

	it.each<{ propertyName: keyof CurrentGameRoundSessions[number]; propertyValue: unknown }>([
		{ propertyName: "playerNickname", propertyValue: undefined },
		{ propertyName: "playerNickname", propertyValue: null },
		{ propertyName: "playerNickname", propertyValue: 42 },
		{ propertyName: "playerNickname", propertyValue: "" },
		{ propertyName: "playerFirstName", propertyValue: undefined },
		{ propertyName: "playerFirstName", propertyValue: null },
		{ propertyName: "playerFirstName", propertyValue: 42 },
		{ propertyName: "playerFirstName", propertyValue: "" },
		{ propertyName: "teamId", propertyValue: undefined },
		{ propertyName: "teamId", propertyValue: null },
		{ propertyName: "teamId", propertyValue: "not-a-number" },
		{ propertyName: "teamId", propertyValue: -1 },
		{ propertyName: "teamId", propertyValue: 1.1 },
		{ propertyName: "teamId", propertyValue: 0 }
	])("fails parsing when $propertyName equals $propertyValue", (input) => {
		const { propertyName, propertyValue } = input;
		const parseResult = safeParse(
			currentGameRoundSessionsSchema,
			currentGameRoundSessionFactory.buildList(4, { [propertyName]: propertyValue })
		);

		expect(parseResult.success).toBe(false);
	});
});
