import { get } from "svelte/store";
import { Maybe } from "true-myth/maybe";
import { assert, test, vi, type TestFunction } from "vitest";
import { createTeamsStore, type Team } from "../../../src/team/teams-store-factory";

function createFakeStorage(overrides: Partial<Storage> = {}): Storage {
	return {
		getItem: overrides.getItem ?? vi.fn().mockReturnValue(null),
		setItem: overrides.setItem ?? vi.fn()
	} as unknown as Storage;
}

interface TestStoreValueOptions {
	readonly storageValue: unknown;
	readonly expectedStoreValue: ReadonlyMap<number, Team>;
}

function testStoreValue(testOptions: TestStoreValueOptions): TestFunction {
	return () => {
		const { storageValue, expectedStoreValue } = testOptions;
		const getItem = vi.fn().mockReturnValue(storageValue);
		const fakeStorage = createFakeStorage({ getItem });
		const teamStore = createTeamsStore(fakeStorage);

		const teamsFromStore = get(teamStore);
		assert.deepStrictEqual(teamsFromStore, expectedStoreValue);
	};
}

test('createTeamsStore() uses the correct storage key "teams"', () => {
	const getItem = vi.fn().mockReturnValue(null);
	const fakeStorage = createFakeStorage({ getItem });
	createTeamsStore(fakeStorage);

	assert.strictEqual(getItem.mock.calls[0]?.[0], "teams");
});

test(
	"createTeamsStore() sets store value to an empty Map when storage returns null",
	testStoreValue({
		storageValue: null,
		expectedStoreValue: new Map()
	})
);

test(
	"createTeamsStore() sets store value to an empty Map when storage returns an empty string",
	testStoreValue({
		storageValue: "",
		expectedStoreValue: new Map()
	})
);

test(
	"createTeamsStore() sets store value to an empty Map when storage returns an invalid JSON",
	testStoreValue({
		storageValue: "[",
		expectedStoreValue: new Map()
	})
);

test(
	"createTeamsStore() sets store value to an empty Map when storage returns an empty Array",
	testStoreValue({
		storageValue: "[]",
		expectedStoreValue: new Map()
	})
);

test(
	"createTeamsStore() sets store value to an empty Map when storage returns a filled Array with empty objects",
	testStoreValue({
		storageValue: "[{ }]",
		expectedStoreValue: new Map()
	})
);

test(
	"createTeamsStore() sets store value to an empty Map when storage returns a filled Array filled with an empty Array",
	testStoreValue({
		storageValue: "[[ ]]",
		expectedStoreValue: new Map()
	})
);

test(
	"createTeamsStore() sets store value to an empty Map when storage returns a filled Array with an empty objects",
	testStoreValue({
		storageValue: "[[1, { }]]",
		expectedStoreValue: new Map()
	})
);

test(
	"createTeamsStore() sets store value to an empty Map when storage returns a filled Array with unknown properties",
	testStoreValue({
		storageValue: '[[1, { "foo": 42 }]]',
		expectedStoreValue: new Map()
	})
);

test(
	"createTeamsStore() sets store value to an empty Map when storage returns a filled Array with additional unknown properties",
	testStoreValue({
		storageValue: '[[1, { "teamName": "", "foo": 42 }]]',
		expectedStoreValue: new Map()
	})
);

test(
	"createTeamsStore() sets store value to an empty Map when storage returns an invalid 'teamName'",
	testStoreValue({
		storageValue: '[[1, { "teamName": {} }]]',
		expectedStoreValue: new Map()
	})
);

test(
	'createTeamsStore() sets store value correctly when storage returns one single team without "gamePoints" property set',
	testStoreValue({
		storageValue: '[[1, { "teamName": "" }]]',
		expectedStoreValue: new Map([[1, { teamName: "", gamePoints: Maybe.nothing() }]])
	})
);

test(
	"createTeamsStore() sets store value correctly when storage returns one single team",
	testStoreValue({
		storageValue: '[[1, { "teamName": "", "gamePoints": 42 }]]',
		expectedStoreValue: new Map([[1, { teamName: "", gamePoints: Maybe.just(42) }]])
	})
);

test(
	'createTeamsStore() sets store value correctly when storage returns more than one team without "gamePoints" property set',
	testStoreValue({
		storageValue: '[[1, { "teamName": "one" }], [2, { "teamName": "two" }]]',
		expectedStoreValue: new Map([
			[1, { teamName: "one", gamePoints: Maybe.nothing() }],
			[2, { teamName: "two", gamePoints: Maybe.nothing() }]
		])
	})
);

test(
	"createTeamsStore() sets store value correctly when storage returns more than one team",
	testStoreValue({
		storageValue: '[[1, { "teamName": "one", "gamePoints": 2 }], [2, { "teamName": "two", "gamePoints": 0 }]]',
		expectedStoreValue: new Map([
			[1, { teamName: "one", gamePoints: Maybe.just(2) }],
			[2, { teamName: "two", gamePoints: Maybe.just(0) }]
		])
	})
);

test('createTeamsStore() sets item in storage when setting an item without "gamePoints" in the store', () => {
	const setItem = vi.fn();
	const fakeStorage = createFakeStorage({ setItem });
	const teamsStore = createTeamsStore(fakeStorage);

	teamsStore.set(new Map([[1, { teamName: "one", gamePoints: Maybe.nothing() }]]));

	assert.strictEqual(setItem.mock.calls.length, 2);
	assert.deepStrictEqual(setItem.mock.calls[0], ["teams", "[]"]);
	assert.deepStrictEqual(setItem.mock.calls[1], ["teams", '[[1,{"teamName":"one"}]]']);
});

test("createTeamsStore() sets item in storage when setting an item in the store", () => {
	const setItem = vi.fn();
	const fakeStorage = createFakeStorage({ setItem });
	const teamsStore = createTeamsStore(fakeStorage);

	teamsStore.set(new Map([[1, { teamName: "one", gamePoints: Maybe.just(2) }]]));

	assert.strictEqual(setItem.mock.calls.length, 2);
	assert.deepStrictEqual(setItem.mock.calls[0], ["teams", "[]"]);
	assert.deepStrictEqual(setItem.mock.calls[1], ["teams", '[[1,{"teamName":"one","gamePoints":2}]]']);
});

test('createTeamsStore() sets item in storage when updating an item without "gamePoints" in the store', () => {
	const setItem = vi.fn();
	const fakeStorage = createFakeStorage({ setItem });
	const teamsStore = createTeamsStore(fakeStorage);

	teamsStore.update((teams) => {
		return teams.set(1, {
			teamName: "one",
			gamePoints: Maybe.nothing()
		});
	});

	assert.strictEqual(setItem.mock.calls.length, 2);
	assert.deepStrictEqual(setItem.mock.calls[0], ["teams", "[]"]);
	assert.deepStrictEqual(setItem.mock.calls[1], ["teams", '[[1,{"teamName":"one"}]]']);
});

test("createTeamsStore() sets item in storage when updating an item in the store", () => {
	const setItem = vi.fn();
	const fakeStorage = createFakeStorage({ setItem });
	const teamsStore = createTeamsStore(fakeStorage);

	teamsStore.update((teams) => {
		return teams.set(1, {
			teamName: "one",
			gamePoints: Maybe.just(4)
		});
	});

	assert.strictEqual(setItem.mock.calls.length, 2);
	assert.deepStrictEqual(setItem.mock.calls[0], ["teams", "[]"]);
	assert.deepStrictEqual(setItem.mock.calls[1], ["teams", '[[1,{"teamName":"one","gamePoints":4}]]']);
});
