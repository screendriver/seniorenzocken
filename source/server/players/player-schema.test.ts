import { describe, it, expect } from "vitest";
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

describe("playerSchema", () => {
	it("fails parsing when given data is undefined", () => {
		const parseResult = safeParse(playerSchema, undefined);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is null", () => {
		const parseResult = safeParse(playerSchema, null);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is not an object", () => {
		const parseResult = safeParse(playerSchema, "not-an-object");

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is an empty object", () => {
		const parseResult = safeParse(playerSchema, {});

		expect(parseResult.success).toBe(false);
	});

	it.each<{ propertyName: keyof Player; value: unknown }>([
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
	])("fails parsing when $propertyName equals $value", (input) => {
		const { propertyName, value } = input;
		const player = playerFactory.build({ [propertyName]: value });
		const parseResult = safeParse(playerSchema, player);

		expect(parseResult.success).toBe(false);
	});

	it.each<{ propertyName: keyof Player; value: unknown }>([
		{ propertyName: "playerId", value: 1 },
		{ propertyName: "firstName", value: "non-empty-string" },
		{ propertyName: "lastName", value: "non-empty-string" },
		{ propertyName: "nickname", value: "non-empty-string" },
		{ propertyName: "totalPoints", value: 0 },
		{ propertyName: "totalPoints", value: 1 },
		{ propertyName: "totalGamesCount", value: 0 },
		{ propertyName: "totalGamesCount", value: 1 }
	])("succeeds parsing when $propertyName equals $value", (input) => {
		const { propertyName, value } = input;
		const player = playerFactory.build({ [propertyName]: value });
		const parseResult = safeParse(playerSchema, player);

		expect(parseResult.success).toBe(true);
	});
});

describe("playersSchema", () => {
	it("fails parsing when given data is undefined", () => {
		const parseResult = safeParse(playersSchema, undefined);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is null", () => {
		const parseResult = safeParse(playersSchema, null);

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is not an array", () => {
		const parseResult = safeParse(playersSchema, "not-an-array");

		expect(parseResult.success).toBe(false);
	});

	it("fails parsing when given data is an empty array", () => {
		const parseResult = safeParse(playersSchema, []);

		expect(parseResult.success).toBe(false);
	});

	it.each<{ propertyName: keyof Player; value: unknown }>([
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
	])("fails parsing when [0][$propertyName] equals $value", (input) => {
		const { propertyName, value } = input;
		const players = playerFactory.buildList(1, { [propertyName]: value });
		const parseResult = safeParse(playersSchema, players);

		expect(parseResult.success).toBe(false);
	});

	it.each<{ propertyName: keyof Player; value: unknown }>([
		{ propertyName: "playerId", value: 1 },
		{ propertyName: "firstName", value: "non-empty-string" },
		{ propertyName: "lastName", value: "non-empty-string" },
		{ propertyName: "nickname", value: "non-empty-string" },
		{ propertyName: "totalPoints", value: 0 },
		{ propertyName: "totalPoints", value: 1 },
		{ propertyName: "totalGamesCount", value: 0 },
		{ propertyName: "totalGamesCount", value: 1 }
	])("succeeds parsing when [0][$propertyName] equals $value", (input) => {
		const { propertyName, value } = input;
		const players = playerFactory.buildList(1, { [propertyName]: value });
		const parseResult = safeParse(playersSchema, players);

		expect(parseResult.success).toBe(true);
	});
});
