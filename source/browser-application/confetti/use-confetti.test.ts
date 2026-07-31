import assert from "node:assert";
import { suite, test } from "mocha";
import { shouldLaunchConfetti } from "./use-confetti.js";

suite("shouldLaunchConfetti()", function () {
	test("returns true when show confetti changes from false to true", function () {
		const result = shouldLaunchConfetti(false, true);

		assert.strictEqual(result, true);
	});

	test("returns false when show confetti stays true", function () {
		const result = shouldLaunchConfetti(true, true);

		assert.strictEqual(result, false);
	});

	test("returns false when show confetti stays false", function () {
		const result = shouldLaunchConfetti(false, false);

		assert.strictEqual(result, false);
	});

	test("returns false when show confetti changes from true to false", function () {
		const result = shouldLaunchConfetti(true, false);

		assert.strictEqual(result, false);
	});
});
