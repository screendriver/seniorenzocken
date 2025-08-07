import { suite, test, expect, vi, type TestFunction } from "vitest";
import type canvasConfetti from "canvas-confetti";
import { createPinia, setActivePinia } from "pinia";
import { useGameStore } from "../game-store/game-store.js";
import { useConfetti } from "./use-confetti.js";

function withPinia(testFunction: () => Promise<void>): TestFunction {
	return async () => {
		setActivePinia(createPinia());

		await testFunction();
	};
}

suite("useConfetti()", () => {
	test(
		"does not call given confetti function when confetti should not be shown",
		withPinia(async () => {
			const gameStore = useGameStore();
			gameStore.showConfetti = false;

			const confetti = vi.fn() as unknown as typeof canvasConfetti;
			useConfetti(confetti);

			expect(confetti).not.toHaveBeenCalled();
		})
	);

	test(
		"calls given confetti function when confetti should be shown",
		withPinia(async () => {
			const gameStore = useGameStore();
			gameStore.showConfetti = true;

			const confetti = vi.fn().mockResolvedValue(undefined) as unknown as typeof canvasConfetti;
			useConfetti(confetti);

			await confetti();

			expect(confetti).toHaveBeenCalledWith({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 }
			});
			expect(gameStore.showConfetti).toBe(false);
		})
	);
});
