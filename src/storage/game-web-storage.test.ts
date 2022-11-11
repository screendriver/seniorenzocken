import { test, assert, vi, type Mock } from "vitest";
import type { Team } from "../game-state/teams.js";
import { createGameWebStorage } from "./game-web-storage.js";

interface CreateFakeWebStorageOverrides {
	setItem?(): Mock;
}

function createFakeWebStorage(overrides: CreateFakeWebStorageOverrides): Storage {
	return {
		setItem: overrides.setItem ?? vi.fn()
	} as unknown as Storage;
}

test("setTeams() sets an empty object when given teams is empty", () => {
	const setItem = vi.fn();
	const fakeWebStorage = createFakeWebStorage({ setItem });
	const gameWebStorage = createGameWebStorage(fakeWebStorage);

	const teams = new Map<number, Team>();
	gameWebStorage.setTeams(teams);

	assert.deepStrictEqual(setItem.mock.calls, [["teams", "{}"]]);
});

test("setTeams() sets the serialized given teams", () => {
	const setItem = vi.fn();
	const fakeWebStorage = createFakeWebStorage({ setItem });
	const gameWebStorage = createGameWebStorage(fakeWebStorage);

	const teams = new Map<number, Team>([
		[1, { teamName: "first", gamePoints: 0, isStretched: false }],
		[2, { teamName: "second", gamePoints: 0, isStretched: false }]
	]);
	gameWebStorage.setTeams(teams);

	assert.deepStrictEqual(setItem.mock.calls[0], [
		"teams",
		'{"1":{"teamName":"first","gamePoints":0,"isStretched":false},"2":{"teamName":"second","gamePoints":0,"isStretched":false}}'
	]);
});
