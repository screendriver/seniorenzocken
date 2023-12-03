import test from "ava";
import { get } from "svelte/store";
import type { SettingsStoreState } from "./settings-store.js";
import { createSettingsStore } from "./settings-store.js";

test("settingsStore has an initial state", (t) => {
	const settingsStore = createSettingsStore();

	const actual = get(settingsStore);
	const expected: SettingsStoreState = {
		isWakeLockSupported: false,
		keepDisplayTurnedOn: true,
		audioEnabled: true,
	};

	t.deepEqual(actual, expected);
});

test("settingsStore.setWakeLockSupported() sets wake lock supported to true", (t) => {
	const settingsStore = createSettingsStore();

	settingsStore.setWakeLockSupported(true);

	t.true(get(settingsStore).isWakeLockSupported);
});

test("settingsStore.setKeepDisplayTurnedOn() sets keep display turned on to false", (t) => {
	const settingsStore = createSettingsStore();

	settingsStore.setKeepDisplayTurnedOn(false);

	t.false(get(settingsStore).keepDisplayTurnedOn);
});

test("settingsStore.setEnableAudio() sets audio enabled to false", (t) => {
	const settingsStore = createSettingsStore();

	settingsStore.setEnableAudio(false);

	t.false(get(settingsStore).audioEnabled);
});
