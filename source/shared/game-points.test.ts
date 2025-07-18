import { suite, test, expect } from "vitest";
import { parse } from "valibot";
import {
	gamePointsPerRound,
	gamePointsPerRoundSchema,
	matchTotalGamePoints,
	matchTotalGamePointsSchema,
} from "./game-points.ts";

suite("gamePointsPerRound", () => {
	test("has correct values", () => {
		expect(gamePointsPerRound).toEqual([0, 2, 3, 4]);
	});
});

suite("gamePointsPerRoundSchema", () => {
	test("parsing failed when given data is undefined", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, undefined);
		}).toThrowError("Invalid type: Expected (0 | 2 | 3 | 4) but received undefined");
	});

	test("parsing failed when given data is null", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, null);
		}).toThrowError("Invalid type: Expected (0 | 2 | 3 | 4) but received null");
	});

	test("parsing failed when given data is not a number", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, "not-a-number");
		}).toThrowError('Invalid type: Expected (0 | 2 | 3 | 4) but received "not-a-number"');
	});

	test("parsing failed when given number is a negative number", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, -1);
		}).toThrowError("Invalid type: Expected (0 | 2 | 3 | 4) but received -1");
	});

	test("parsing failed when given number equals 1", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, 1);
		}).toThrowError("Invalid type: Expected (0 | 2 | 3 | 4) but received 1");
	});

	test("parsing failed when given number is out of range", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, 5);
		}).toThrowError("Invalid type: Expected (0 | 2 | 3 | 4) but received 5");
	});

	test("parsing succeeds when given number equals 0", () => {
		const gamePointsPerRound = parse(gamePointsPerRoundSchema, 0);

		expect(gamePointsPerRound).toBe(0);
	});

	test("parsing succeeds when given number equals 2", () => {
		const gamePointsPerRound = parse(gamePointsPerRoundSchema, 2);

		expect(gamePointsPerRound).toBe(2);
	});

	test("parsing succeeds when given number equals 3", () => {
		const gamePointsPerRound = parse(gamePointsPerRoundSchema, 3);

		expect(gamePointsPerRound).toBe(3);
	});

	test("parsing succeeds when given number equals 4", () => {
		const gamePointsPerRound = parse(gamePointsPerRoundSchema, 4);

		expect(gamePointsPerRound).toBe(4);
	});
});

suite("matchTotalGamePoints", () => {
	test("has correct values", () => {
		expect(matchTotalGamePoints).toEqual([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
	});
});

suite("matchTotalGamePointsSchema", () => {
	test("parsing failed when given data is undefined", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, undefined);
		}).toThrowError(
			"Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received undefined",
		);
	});

	test("parsing failed when given data is null", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, null);
		}).toThrowError(
			"Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received null",
		);
	});

	test("parsing failed when given data is not a number", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, "not-a-number");
		}).toThrowError(
			'Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received "not-a-number"',
		);
	});

	test("parsing failed when given number is a negative number", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, -1);
		}).toThrowError(
			"Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received -1",
		);
	});

	test("parsing failed when given number equals 1", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, 1);
		}).toThrowError(
			"Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received 1",
		);
	});

	test("parsing failed when given number is out of range", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, 19);
		}).toThrowError(
			"Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received 19",
		);
	});

	test("parsing succeeds when given number equals 0", () => {
		const gamePointsPerRound = parse(matchTotalGamePointsSchema, 0);

		expect(gamePointsPerRound).toBe(0);
	});

	test("parsing succeeds when given number equals 2", () => {
		const gamePointsPerRound = parse(matchTotalGamePointsSchema, 2);

		expect(gamePointsPerRound).toBe(2);
	});

	test("parsing succeeds when given number equals 3", () => {
		const gamePointsPerRound = parse(matchTotalGamePointsSchema, 3);

		expect(gamePointsPerRound).toBe(3);
	});

	test("parsing succeeds when given number equals 4", () => {
		const gamePointsPerRound = parse(matchTotalGamePointsSchema, 4);

		expect(gamePointsPerRound).toBe(4);
	});
});
