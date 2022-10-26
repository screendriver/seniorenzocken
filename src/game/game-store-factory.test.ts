import { get } from "svelte/store";
import { assert, test, vi, type TestFunction } from "vitest";
import { createIsGameStartedStore } from "./game-store-factory";

function createFakeStorage(overrides: Partial<Storage> = {}): Storage {
	return {
		getItem: overrides.getItem ?? vi.fn().mockReturnValue(null),
		setItem: overrides.setItem ?? vi.fn()
	} as unknown as Storage;
}

interface TestStoreValueOptions {
	readonly storageValue: unknown;
	readonly expectedStoreValue: boolean;
}

function testStoreValue(testOptions: TestStoreValueOptions): TestFunction {
	return () => {
		const { storageValue, expectedStoreValue } = testOptions;
		const getItem = vi.fn().mockReturnValue(storageValue);
		const fakeStorage = createFakeStorage({ getItem });
		const isGameStartedStore = createIsGameStartedStore(fakeStorage);

		const isGameStartedFromStore = get(isGameStartedStore);
		assert.deepStrictEqual(isGameStartedFromStore, expectedStoreValue);
	};
}

test(
	"createIsGameStartedStore() sets store value to false when storage returns null",
	testStoreValue({
		storageValue: null,
		expectedStoreValue: false
	})
);

test(
	"createIsGameStartedStore() sets store value to false when storage returns an empty string",
	testStoreValue({
		storageValue: "",
		expectedStoreValue: false
	})
);

test(
	"createIsGameStartedStore() sets store value to false when storage returns an invalid JSON",
	testStoreValue({
		storageValue: "[",
		expectedStoreValue: false
	})
);

test(
	'createIsGameStartedStore() sets store value to false when storage returns "false"',
	testStoreValue({
		storageValue: "false",
		expectedStoreValue: false
	})
);

test(
	'createIsGameStartedStore() sets store value to true when storage returns "true"',
	testStoreValue({
		storageValue: "true",
		expectedStoreValue: true
	})
);

test("createIsGameStartedStore() sets item in storage when setting an item in the store", () => {
	const setItem = vi.fn();
	const fakeStorage = createFakeStorage({ setItem });
	const isGameStartedStore = createIsGameStartedStore(fakeStorage);

	isGameStartedStore.set(true);

	assert.strictEqual(setItem.mock.calls.length, 2);
	assert.deepStrictEqual(setItem.mock.calls[0], ["is-game-started", "false"]);
	assert.deepStrictEqual(setItem.mock.calls[1], ["is-game-started", "true"]);
});

test("createIsGameStartedStore() sets item in storage when updating an item in the store", () => {
	const setItem = vi.fn();
	const fakeStorage = createFakeStorage({ setItem });
	const isGameStartedStore = createIsGameStartedStore(fakeStorage);

	isGameStartedStore.update(() => {
		return true;
	});

	assert.strictEqual(setItem.mock.calls.length, 2);
	assert.deepStrictEqual(setItem.mock.calls[0], ["is-game-started", "false"]);
	assert.deepStrictEqual(setItem.mock.calls[1], ["is-game-started", "true"]);
});
