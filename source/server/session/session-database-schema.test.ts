import { describe, it, expect, assert } from "vitest";
import { safeParse } from "valibot";
import { Factory } from "fishery";
import {
	currentGameRoundSessionsDatabaseSelectSchema,
	sessionDatabaseSelectSchema,
	type CurrentGameRoundSessionsDatabaseSelect
} from "./session-database-schema.js";

const sessionFactory = Factory.define(() => {
	return {
		token: "test-token"
	};
});

const currentGameRoundSessionFactory = Factory.define(() => {
	return {
		playerId: 1,
		playerNickname: "test-nickname",
		playerFirstName: "test-first-name",
		teamId: 1,
		gamePoints: null
	};
});

describe("sessionDatabaseSelectSchema", () => {
	it("fails parsing when given data is undefined", () => {
		const parseResult = safeParse(sessionDatabaseSelectSchema, undefined);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is null", () => {
		const parseResult = safeParse(sessionDatabaseSelectSchema, null);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is not an object", () => {
		const parseResult = safeParse(sessionDatabaseSelectSchema, "not-an-object");

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is an empty object", () => {
		const parseResult = safeParse(sessionDatabaseSelectSchema, {});

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.token is undefined", () => {
		const parseResult = safeParse(sessionDatabaseSelectSchema, sessionFactory.build({ token: undefined }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.token is null", () => {
		const parseResult = safeParse(sessionDatabaseSelectSchema, sessionFactory.build({ token: null }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.token is an empty string", () => {
		const parseResult = safeParse(sessionDatabaseSelectSchema, sessionFactory.build({ token: "" }));

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given object.token is not a string", () => {
		const parseResult = safeParse(sessionDatabaseSelectSchema, sessionFactory.build({ token: 42 }));

		expect(parseResult.success).toBe(false);
	});

	it("succeeds parsing when given object.token is not an empty string", () => {
		const parseResult = safeParse(sessionDatabaseSelectSchema, sessionFactory.build({ token: "test-token" }));

		assert(parseResult.success);

		expect(parseResult.output).toStrictEqual({ token: "test-token" });
	});
});

describe("currentGameRoundSessionsDatabaseSelectSchema", () => {
	it("fails parsing when given data is undefined", () => {
		const parseResult = safeParse(currentGameRoundSessionsDatabaseSelectSchema, undefined);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is null", () => {
		const parseResult = safeParse(currentGameRoundSessionsDatabaseSelectSchema, null);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is not an array", () => {
		const parseResult = safeParse(currentGameRoundSessionsDatabaseSelectSchema, "not-an-array");

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given array is empty", () => {
		const parseResult = safeParse(currentGameRoundSessionsDatabaseSelectSchema, []);

		expect(parseResult.success).toBe(false);
	});

	it.each<{ propertyName: keyof CurrentGameRoundSessionsDatabaseSelect[number]; propertyValue: unknown }>([
		{ propertyName: "playerId", propertyValue: undefined },
		{ propertyName: "playerId", propertyValue: null },
		{ propertyName: "playerId", propertyValue: "not-a-number" },
		{ propertyName: "playerId", propertyValue: -1 },
		{ propertyName: "playerId", propertyValue: 1.1 },
		{ propertyName: "playerId", propertyValue: 0 },
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
		{ propertyName: "teamId", propertyValue: 0 },
		{ propertyName: "gamePoints", propertyValue: undefined },
		{ propertyName: "gamePoints", propertyValue: "not-a-number" },
		{ propertyName: "gamePoints", propertyValue: -1 },
		{ propertyName: "gamePoints", propertyValue: 1.1 }
	])("fails parsing when $propertyName equals $propertyValue", (input) => {
		const { propertyName, propertyValue } = input;
		const parseResult = safeParse(
			currentGameRoundSessionsDatabaseSelectSchema,
			currentGameRoundSessionFactory.buildList(1, { [propertyName]: propertyValue })
		);

		expect(parseResult.success).toBe(false);
	});

	it.each<{ propertyName: keyof CurrentGameRoundSessionsDatabaseSelect[number]; propertyValue: unknown }>([
		{ propertyName: "playerId", propertyValue: 1 },
		{ propertyName: "playerId", propertyValue: 2 },
		{ propertyName: "playerNickname", propertyValue: "test-nickname" },
		{ propertyName: "playerFirstName", propertyValue: "test-nickname" },
		{ propertyName: "teamId", propertyValue: 1 },
		{ propertyName: "teamId", propertyValue: 2 },
		{ propertyName: "gamePoints", propertyValue: null },
		{ propertyName: "gamePoints", propertyValue: 0 },
		{ propertyName: "gamePoints", propertyValue: 2 }
	])("succeeds parsing when $propertyName equals $propertyValue", (input) => {
		const { propertyName, propertyValue } = input;
		const parseResult = safeParse(
			currentGameRoundSessionsDatabaseSelectSchema,
			currentGameRoundSessionFactory.buildList(1, { [propertyName]: propertyValue })
		);

		expect(parseResult.success).toBe(true);
	});
});
