import { describe, it, expect } from "vitest";
import { parse } from "valibot";
import {
	gamePointsPerRound,
	gamePointsPerRoundSchema,
	matchTotalGamePoints,
	matchTotalGamePointsSchema
} from "./game-points.js";

describe("gamePointsPerRound", () => {
	it("has correct values", () => {
		expect(gamePointsPerRound).toStrictEqual([0, 2, 3, 4]);
	});
});

describe("gamePointsPerRoundSchema", () => {
	it("failed parsing when given data is undefined", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, undefined);
		}).toThrow("Invalid type: Expected (0 | 2 | 3 | 4) but received undefined");
	});

	it("failed parsing when given data is null", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, null);
		}).toThrow("Invalid type: Expected (0 | 2 | 3 | 4) but received null");
	});

	it("failed parsing when given data is not a number", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, "not-a-number");
		}).toThrow('Invalid type: Expected (0 | 2 | 3 | 4) but received "not-a-number"');
	});

	it("failed parsing when given number is a negative number", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, -1);
		}).toThrow("Invalid type: Expected (0 | 2 | 3 | 4) but received -1");
	});

	it("failed parsing when given number equals 1", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, 1);
		}).toThrow("Invalid type: Expected (0 | 2 | 3 | 4) but received 1");
	});

	it("failed parsing when given number is out of range", () => {
		expect(() => {
			parse(gamePointsPerRoundSchema, 5);
		}).toThrow("Invalid type: Expected (0 | 2 | 3 | 4) but received 5");
	});

	it("succeeds parsing when given number equals 0", () => {
		const parseResult = parse(gamePointsPerRoundSchema, 0);

		expect(parseResult).toBe(0);
	});

	it("succeeds parsing when given number equals 2", () => {
		const parseResult = parse(gamePointsPerRoundSchema, 2);

		expect(parseResult).toBe(2);
	});

	it("succeeds parsing when given number equals 3", () => {
		const parseResult = parse(gamePointsPerRoundSchema, 3);

		expect(parseResult).toBe(3);
	});

	it("succeeds parsing when given number equals 4", () => {
		const parseResult = parse(gamePointsPerRoundSchema, 4);

		expect(parseResult).toBe(4);
	});
});

describe("matchTotalGamePoints", () => {
	it("has correct values", () => {
		expect(matchTotalGamePoints).toStrictEqual([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
	});
});

describe("matchTotalGamePointsSchema", () => {
	it("failed parsing when given data is undefined", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, undefined);
		}).toThrow(
			"Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received undefined"
		);
	});

	it("failed parsing when given data is null", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, null);
		}).toThrow(
			"Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received null"
		);
	});

	it("failed parsing when given data is not a number", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, "not-a-number");
		}).toThrow(
			'Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received "not-a-number"'
		);
	});

	it("failed parsing when given number is a negative number", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, -1);
		}).toThrow(
			"Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received -1"
		);
	});

	it("failed parsing when given number equals 1", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, 1);
		}).toThrow(
			"Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received 1"
		);
	});

	it("failed parsing when given number is out of range", () => {
		expect(() => {
			parse(matchTotalGamePointsSchema, 19);
		}).toThrow(
			"Invalid type: Expected (0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18) but received 19"
		);
	});

	it("succeeds parsing when given number equals 0", () => {
		const parseResult = parse(matchTotalGamePointsSchema, 0);

		expect(parseResult).toBe(0);
	});

	it("succeeds parsing when given number equals 2", () => {
		const parseResult = parse(matchTotalGamePointsSchema, 2);

		expect(parseResult).toBe(2);
	});

	it("succeeds parsing when given number equals 3", () => {
		const parseResult = parse(matchTotalGamePointsSchema, 3);

		expect(parseResult).toBe(3);
	});

	it("succeeds parsing when given number equals 4", () => {
		const parseResult = parse(matchTotalGamePointsSchema, 4);

		expect(parseResult).toBe(4);
	});
});
