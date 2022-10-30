import { assert, test } from "vitest";
import { shouldShowConfetti } from "./confetti";

test("shouldShowConfetti() returns false when gamePoints equals 0", () => {
	assert.isFalse(shouldShowConfetti(0));
});

test("shouldShowConfetti() returns false when gamePoints equals a negative number", () => {
	assert.isFalse(shouldShowConfetti(-1));
});

test("shouldShowConfetti() returns true when gamePoints equals 4", () => {
	assert.isTrue(shouldShowConfetti(4));
});

test("shouldShowConfetti() returns true when gamePoints is greater than 4", () => {
	assert.isTrue(shouldShowConfetti(5));
});
