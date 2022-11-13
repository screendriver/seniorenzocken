import { test, assert } from "vitest";
import type { Team } from "../team/team-schema.js";
import { createGameWebStorage } from "./game-web-storage.js";

function createInMemoryWebStorage(): Storage {
	const fakeStorage: Record<string, unknown> = {};

	return {
		getItem(key: string) {
			return fakeStorage[key];
		},
		setItem(key: string, value: unknown) {
			fakeStorage[key] = value;
		}
	} as unknown as Storage;
}

test("teams setter sets an empty Array when given teams is empty", () => {
	const inMemoryWebStorage = createInMemoryWebStorage();
	const gameWebStorage = createGameWebStorage(inMemoryWebStorage);

	const teams = new Map<number, Team>();
	gameWebStorage.teams = teams;

	assert.deepStrictEqual(inMemoryWebStorage.getItem("teams"), "[]");
});

test("teams setter sets the serialized given teams", () => {
	const inMemoryWebStorage = createInMemoryWebStorage();
	const gameWebStorage = createGameWebStorage(inMemoryWebStorage);

	const teams = new Map<number, Team>([
		[1, { teamName: "first", gamePoints: 0, isStretched: false }],
		[2, { teamName: "second", gamePoints: 0, isStretched: false }]
	]);
	gameWebStorage.teams = teams;

	assert.deepStrictEqual(
		inMemoryWebStorage.getItem("teams"),
		'[[1,{"teamName":"first","gamePoints":0,"isStretched":false}],[2,{"teamName":"second","gamePoints":0,"isStretched":false}]]'
	);
});

test("teams getter returns an empty Map by default when web storage is empty", () => {
	const inMemoryWebStorage = createInMemoryWebStorage();
	const gameWebStorage = createGameWebStorage(inMemoryWebStorage);

	const actual = gameWebStorage.teams;
	const expected = new Map();

	assert.deepStrictEqual(actual, expected);
});

test("teams getter returns the previously set teams from given web storage", () => {
	const inMemoryWebStorage = createInMemoryWebStorage();
	const gameWebStorage = createGameWebStorage(inMemoryWebStorage);

	const teams = new Map<number, Team>([
		[1, { teamName: "first", gamePoints: 0, isStretched: false }],
		[2, { teamName: "second", gamePoints: 0, isStretched: false }]
	]);

	gameWebStorage.teams = teams;

	const actual = gameWebStorage.teams;
	const expected = teams;

	assert.deepStrictEqual(actual, expected);
});
