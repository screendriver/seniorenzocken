import assert from "node:assert";
import { suite, test } from "mocha";
import { parse } from "valibot";
import {
	gamePointsPerRound,
	gamePointsPerRoundSchema,
	matchTotalGamePoints,
	matchTotalGamePointsSchema
} from "./game-points.js";

suite("gamePointsPerRound", function () {
	test("has correct values", function () {
		assert.deepStrictEqual(gamePointsPerRound, [0, 2, 3, 4]);
	});
});

suite("gamePointsPerRoundSchema", function () {
	test("failed parsing when given data is undefined", function () {
		assert.throws(() => {
			parse(gamePointsPerRoundSchema, undefined);
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4\) but received undefined/u);
	});

	test("failed parsing when given data is null", function () {
		assert.throws(() => {
			parse(gamePointsPerRoundSchema, null);
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4\) but received null/u);
	});

	test("failed parsing when given data is not a number", function () {
		assert.throws(() => {
			parse(gamePointsPerRoundSchema, "not-a-number");
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4\) but received "not-a-number"/u);
	});

	test("failed parsing when given number is a negative number", function () {
		assert.throws(() => {
			parse(gamePointsPerRoundSchema, -1);
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4\) but received -1/u);
	});

	test("failed parsing when given number equals 1", function () {
		assert.throws(() => {
			parse(gamePointsPerRoundSchema, 1);
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4\) but received 1/u);
	});

	test("failed parsing when given number is out of range", function () {
		assert.throws(() => {
			parse(gamePointsPerRoundSchema, 5);
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4\) but received 5/u);
	});

	test("succeeds parsing when given number equals 0", function () {
		const parseResult = parse(gamePointsPerRoundSchema, 0);

		assert.strictEqual(parseResult, 0);
	});

	test("succeeds parsing when given number equals 2", function () {
		const parseResult = parse(gamePointsPerRoundSchema, 2);

		assert.strictEqual(parseResult, 2);
	});

	test("succeeds parsing when given number equals 3", function () {
		const parseResult = parse(gamePointsPerRoundSchema, 3);

		assert.strictEqual(parseResult, 3);
	});

	test("succeeds parsing when given number equals 4", function () {
		const parseResult = parse(gamePointsPerRoundSchema, 4);

		assert.strictEqual(parseResult, 4);
	});
});

suite("matchTotalGamePoints", function () {
	test("has correct values", function () {
		assert.deepStrictEqual(matchTotalGamePoints, [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
	});
});

suite("matchTotalGamePointsSchema", function () {
	test("failed parsing when given data is undefined", function () {
		assert.throws(() => {
			parse(matchTotalGamePointsSchema, undefined);
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18\) but received undefined/u);
	});

	test("failed parsing when given data is null", function () {
		assert.throws(() => {
			parse(matchTotalGamePointsSchema, null);
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18\) but received null/u);
	});

	test("failed parsing when given data is not a number", function () {
		assert.throws(() => {
			parse(matchTotalGamePointsSchema, "not-a-number");
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18\) but received "not-a-number"/u);
	});

	test("failed parsing when given number is a negative number", function () {
		assert.throws(() => {
			parse(matchTotalGamePointsSchema, -1);
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18\) but received -1/u);
	});

	test("failed parsing when given number equals 1", function () {
		assert.throws(() => {
			parse(matchTotalGamePointsSchema, 1);
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18\) but received 1/u);
	});

	test("failed parsing when given number is out of range", function () {
		assert.throws(() => {
			parse(matchTotalGamePointsSchema, 19);
		}, /Invalid type: Expected \(0 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16 \| 17 \| 18\) but received 19/u);
	});

	test("succeeds parsing when given number equals 0", function () {
		const parseResult = parse(matchTotalGamePointsSchema, 0);

		assert.strictEqual(parseResult, 0);
	});

	test("succeeds parsing when given number equals 2", function () {
		const parseResult = parse(matchTotalGamePointsSchema, 2);

		assert.strictEqual(parseResult, 2);
	});

	test("succeeds parsing when given number equals 3", function () {
		const parseResult = parse(matchTotalGamePointsSchema, 3);

		assert.strictEqual(parseResult, 3);
	});

	test("succeeds parsing when given number equals 4", function () {
		const parseResult = parse(matchTotalGamePointsSchema, 4);

		assert.strictEqual(parseResult, 4);
	});
});
