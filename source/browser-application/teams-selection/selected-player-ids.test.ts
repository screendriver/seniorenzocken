import assert from "node:assert";
import { suite, test } from "mocha";
import { areSelectedPlayerIdsValid } from "./selected-player-ids.js";

suite("areSelectedPlayerIdsValid()", function () {
	test("returns false when given selected player ids is an empty Array", function () {
		assert.strictEqual(areSelectedPlayerIdsValid([]), false);
	});

	test("returns false when not every selected player has an id", function () {
		assert.strictEqual(areSelectedPlayerIdsValid([1, 2, -1, 4]), false);
	});

	test("returns false when multiple selected players have the same id", function () {
		assert.strictEqual(areSelectedPlayerIdsValid([1, 2, 3, 1]), false);
	});

	test("returns true when all selected players have a different id", function () {
		assert.strictEqual(areSelectedPlayerIdsValid([1, 2, 3, 4]), true);
	});
});
