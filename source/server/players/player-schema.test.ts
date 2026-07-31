import assert from "node:assert";
import { suite, test } from "mocha";
import { safeParse } from "valibot";
import { Factory } from "fishery";
import { playerSchema, playersSchema, type Player } from "./player-schema.js";

const playerFactory = Factory.define<unknown>(() => {
	return {
		playerId: 1,
		firstName: "John",
		lastName: "Doe",
		nickname: "Player",
		totalPoints: 0,
		totalGamesCount: 0
	};
});

type PlayerPropertyTestCase = {
	readonly propertyName: keyof Player;
	readonly value: unknown;
};

const invalidPlayerPropertyTestCases: readonly PlayerPropertyTestCase[] = [
	{ propertyName: "playerId", value: undefined },
	{ propertyName: "playerId", value: null },
	{ propertyName: "playerId", value: "not-a-number" },
	{ propertyName: "playerId", value: -1 },
	{ propertyName: "playerId", value: 1.1 },
	{ propertyName: "firstName", value: undefined },
	{ propertyName: "firstName", value: null },
	{ propertyName: "firstName", value: 42 },
	{ propertyName: "firstName", value: "" },
	{ propertyName: "lastName", value: undefined },
	{ propertyName: "lastName", value: null },
	{ propertyName: "lastName", value: 42 },
	{ propertyName: "lastName", value: "" },
	{ propertyName: "nickname", value: undefined },
	{ propertyName: "nickname", value: null },
	{ propertyName: "nickname", value: 42 },
	{ propertyName: "nickname", value: "" },
	{ propertyName: "totalPoints", value: undefined },
	{ propertyName: "totalPoints", value: null },
	{ propertyName: "totalPoints", value: "not-a-number" },
	{ propertyName: "totalPoints", value: -1 },
	{ propertyName: "totalPoints", value: -1 },
	{ propertyName: "totalPoints", value: 1.1 },
	{ propertyName: "totalGamesCount", value: undefined },
	{ propertyName: "totalGamesCount", value: null },
	{ propertyName: "totalGamesCount", value: "not-a-number" },
	{ propertyName: "totalGamesCount", value: -1 },
	{ propertyName: "totalGamesCount", value: -1 },
	{ propertyName: "totalGamesCount", value: 1.1 }
];

const validPlayerPropertyTestCases: readonly PlayerPropertyTestCase[] = [
	{ propertyName: "playerId", value: 1 },
	{ propertyName: "firstName", value: "non-empty-string" },
	{ propertyName: "lastName", value: "non-empty-string" },
	{ propertyName: "nickname", value: "non-empty-string" },
	{ propertyName: "totalPoints", value: 0 },
	{ propertyName: "totalPoints", value: 1 },
	{ propertyName: "totalGamesCount", value: 0 },
	{ propertyName: "totalGamesCount", value: 1 }
];

suite("playerSchema", function () {
	test("fails parsing when given data is undefined", function () {
		const parseResult = safeParse(playerSchema, undefined);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is null", function () {
		const parseResult = safeParse(playerSchema, null);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is not an object", function () {
		const parseResult = safeParse(playerSchema, "not-an-object");

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is an empty object", function () {
		const parseResult = safeParse(playerSchema, {});

		assert.strictEqual(parseResult.success, false);
	});

	for (const testCase of invalidPlayerPropertyTestCases) {
		const { propertyName, value } = testCase;

		test(`fails parsing when ${propertyName} equals ${String(value)}`, function () {
			const player = playerFactory.build({ [propertyName]: value });
			const parseResult = safeParse(playerSchema, player);

			assert.strictEqual(parseResult.success, false);
		});
	}

	for (const testCase of validPlayerPropertyTestCases) {
		const { propertyName, value } = testCase;

		test(`succeeds parsing when ${propertyName} equals ${String(value)}`, function () {
			const player = playerFactory.build({ [propertyName]: value });
			const parseResult = safeParse(playerSchema, player);

			assert.strictEqual(parseResult.success, true);
		});
	}
});

suite("playersSchema", function () {
	test("fails parsing when given data is undefined", function () {
		const parseResult = safeParse(playersSchema, undefined);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is null", function () {
		const parseResult = safeParse(playersSchema, null);

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is not an array", function () {
		const parseResult = safeParse(playersSchema, "not-an-array");

		assert.strictEqual(parseResult.success, false);
	});

	test("fails parsing when given data is an empty array", function () {
		const parseResult = safeParse(playersSchema, []);

		assert.strictEqual(parseResult.success, false);
	});

	for (const testCase of invalidPlayerPropertyTestCases) {
		const { propertyName, value } = testCase;

		test(`fails parsing when [0][${propertyName}] equals ${String(value)}`, function () {
			const players = playerFactory.buildList(1, { [propertyName]: value });
			const parseResult = safeParse(playersSchema, players);

			assert.strictEqual(parseResult.success, false);
		});
	}

	for (const testCase of validPlayerPropertyTestCases) {
		const { propertyName, value } = testCase;

		test(`succeeds parsing when [0][${propertyName}] equals ${String(value)}`, function () {
			const players = playerFactory.buildList(1, { [propertyName]: value });
			const parseResult = safeParse(playersSchema, players);

			assert.strictEqual(parseResult.success, true);
		});
	}
});
