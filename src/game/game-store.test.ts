import { get } from "svelte/store";
import { assert, test } from "vitest";
import { isGameStarted } from "./game-store";

test("isGameStarted returns false by default", () => {
	const started = get(isGameStarted);

	assert.isFalse(started);
});

test("isGameStarted allows to set a boolean", () => {
	isGameStarted.set(true);

	const started = get(isGameStarted);

	assert.isTrue(started);
});
