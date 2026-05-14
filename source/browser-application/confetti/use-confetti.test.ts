import { describe, expect, it } from "vitest";
import { shouldLaunchConfetti } from "./use-confetti.js";

describe(shouldLaunchConfetti, () => {
	it("returns true when show confetti changes from false to true", () => {
		const result = shouldLaunchConfetti(false, true);

		expect(result).toBe(true);
	});

	it("returns false when show confetti stays true", () => {
		const result = shouldLaunchConfetti(true, true);

		expect(result).toBe(false);
	});

	it("returns false when show confetti stays false", () => {
		const result = shouldLaunchConfetti(false, false);

		expect(result).toBe(false);
	});

	it("returns false when show confetti changes from true to false", () => {
		const result = shouldLaunchConfetti(true, false);

		expect(result).toBe(false);
	});
});
