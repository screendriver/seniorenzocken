import assert from "node:assert";
import { suite, test } from "mocha";
import { safeParse } from "valibot";
import { Factory } from "fishery";
import { just, nothing } from "true-myth/maybe";
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
		gamePoints: null,
		hasPreviousGameRounds: 0
	};
});

type CurrentGameRoundSessionPropertyName = keyof CurrentGameRoundSessionsDatabaseSelect[number];

type CurrentGameRoundSessionPropertyTestCase = {
	readonly propertyName: CurrentGameRoundSessionPropertyName;
	readonly propertyValue: unknown;
};

type ValidCurrentGameRoundSessionPropertyTestCase = CurrentGameRoundSessionPropertyTestCase & {
	readonly expectedPropertyValue: unknown;
};

const invalidCurrentGameRoundSessionPropertyTestCases: readonly CurrentGameRoundSessionPropertyTestCase[] = [
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
	{ propertyName: "gamePoints", propertyValue: 1.1 },
	{ propertyName: "hasPreviousGameRounds", propertyValue: undefined },
	{ propertyName: "hasPreviousGameRounds", propertyValue: null },
	{ propertyName: "hasPreviousGameRounds", propertyValue: "not-a-number" },
	{ propertyName: "hasPreviousGameRounds", propertyValue: -1 },
	{ propertyName: "hasPreviousGameRounds", propertyValue: 2 },
	{ propertyName: "hasPreviousGameRounds", propertyValue: 1.1 }
];

const validCurrentGameRoundSessionPropertyTestCases: readonly ValidCurrentGameRoundSessionPropertyTestCase[] = [
	{ propertyName: "playerId", propertyValue: 1, expectedPropertyValue: 1 },
	{ propertyName: "playerId", propertyValue: 2, expectedPropertyValue: 2 },
	{ propertyName: "playerNickname", propertyValue: "test-nickname", expectedPropertyValue: "test-nickname" },
	{ propertyName: "playerFirstName", propertyValue: "test-nickname", expectedPropertyValue: "test-nickname" },
	{ propertyName: "teamId", propertyValue: 1, expectedPropertyValue: 1 },
	{ propertyName: "teamId", propertyValue: 2, expectedPropertyValue: 2 },
	{ propertyName: "gamePoints", propertyValue: null, expectedPropertyValue: nothing() },
	{ propertyName: "gamePoints", propertyValue: 0, expectedPropertyValue: just(0) },
	{ propertyName: "gamePoints", propertyValue: 2, expectedPropertyValue: just(2) },
	{ propertyName: "hasPreviousGameRounds", propertyValue: 0, expectedPropertyValue: false },
	{ propertyName: "hasPreviousGameRounds", propertyValue: 1, expectedPropertyValue: true }
];

suite("sessionDatabaseSelectSchema", function () {
	test("fails parsing when given data is undefined", function () {
		const parseResult = safeParse(sessionDatabaseSelectSchema, undefined);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is null", function () {
		const parseResult = safeParse(sessionDatabaseSelectSchema, null);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is not an object", function () {
		const parseResult = safeParse(sessionDatabaseSelectSchema, "not-an-object");

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is an empty object", function () {
		const parseResult = safeParse(sessionDatabaseSelectSchema, {});

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.token is undefined", function () {
		const parseResult = safeParse(sessionDatabaseSelectSchema, sessionFactory.build({ token: undefined }));

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.token is null", function () {
		const parseResult = safeParse(sessionDatabaseSelectSchema, sessionFactory.build({ token: null }));

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.token is an empty string", function () {
		const parseResult = safeParse(sessionDatabaseSelectSchema, sessionFactory.build({ token: "" }));

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given object.token is not a string", function () {
		const parseResult = safeParse(sessionDatabaseSelectSchema, sessionFactory.build({ token: 42 }));

		assert.strictEqual(parseResult.success, false);
	});

	test("succeeds parsing when given object.token is not an empty string", function () {
		const parseResult = safeParse(sessionDatabaseSelectSchema, sessionFactory.build({ token: "test-token" }));

		assert.ok(parseResult.success);

		assert.deepStrictEqual(parseResult.output, { token: "test-token" });
	});
});

suite("currentGameRoundSessionsDatabaseSelectSchema", function () {
	test("fails parsing when given data is undefined", function () {
		const parseResult = safeParse(currentGameRoundSessionsDatabaseSelectSchema, undefined);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is null", function () {
		const parseResult = safeParse(currentGameRoundSessionsDatabaseSelectSchema, null);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is not an array", function () {
		const parseResult = safeParse(currentGameRoundSessionsDatabaseSelectSchema, "not-an-array");

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given array is empty", function () {
		const parseResult = safeParse(currentGameRoundSessionsDatabaseSelectSchema, []);

		assert.strictEqual(parseResult.success, false);
	});

	for (const testCase of invalidCurrentGameRoundSessionPropertyTestCases) {
		const { propertyName, propertyValue } = testCase;

		test(`fails parsing when ${propertyName} equals ${String(propertyValue)}`, function () {
			const parseResult = safeParse(
				currentGameRoundSessionsDatabaseSelectSchema,
				currentGameRoundSessionFactory.buildList(1, { [propertyName]: propertyValue })
			);

			assert.strictEqual(parseResult.success, false);
		});
	}

	for (const testCase of validCurrentGameRoundSessionPropertyTestCases) {
		const { propertyName, propertyValue, expectedPropertyValue } = testCase;

		test(`succeeds parsing when ${propertyName} equals ${String(propertyValue)}`, function () {
			const parseResult = safeParse(
				currentGameRoundSessionsDatabaseSelectSchema,
				currentGameRoundSessionFactory.buildList(1, { [propertyName]: propertyValue })
			);

			assert.ok(parseResult.success);

			for (const parsedGameRoundSession of parseResult.output) {
				assert.deepStrictEqual(parsedGameRoundSession[propertyName], expectedPropertyValue);
			}
		});
	}
});
