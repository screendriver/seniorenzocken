import assert from "node:assert";
import { suite, test } from "mocha";
import { isNothing } from "true-myth/maybe";
import { getReactTestingLibrary } from "../test-support/mocha-jsdom.js";
import { useGamePoints } from "./game-points.js";

suite("useGamePoints()", function () {
	test("returns empty selected game points by default", async function () {
		const { renderHook } = await getReactTestingLibrary();
		const { result } = renderHook(useGamePoints);

		assert.deepStrictEqual(result.current.selectedGamePoints, {});
	});

	test("disables previous game round by default", async function () {
		const { renderHook } = await getReactTestingLibrary();
		const { result } = renderHook(useGamePoints);

		assert.strictEqual(result.current.isPreviousGameRoundEnabled, false);
	});

	test("returns Nothing when no game point is selected", async function () {
		const { renderHook } = await getReactTestingLibrary();
		const { result } = renderHook(useGamePoints);

		assert.strictEqual(isNothing(result.current.selectedGamePoint), true);
	});

	test("enables game points by default", async function () {
		const { renderHook } = await getReactTestingLibrary();
		const { result } = renderHook(useGamePoints);

		assert.strictEqual(result.current.isGamePointEnabled(0), true);
	});

	test("disables next game round when all selected game points are below the minimum", async function () {
		const { renderHook } = await getReactTestingLibrary();
		const { result } = renderHook(useGamePoints);

		assert.strictEqual(result.current.isNextGameRoundEnabled, false);
	});

	test("enables next game round when a team has selected at least two game points", async function () {
		const { act, renderHook } = await getReactTestingLibrary();
		const { result } = renderHook(useGamePoints);

		act(() => {
			result.current.setSelectedGamePoints({ 1: 2 });
		});

		assert.strictEqual(result.current.isNextGameRoundEnabled, true);
	});
});
