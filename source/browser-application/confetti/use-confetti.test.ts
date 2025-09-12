import { describe, it, expect, vi, type TestFunction } from "vitest";
import type canvasConfetti from "canvas-confetti";
import { createPinia, setActivePinia } from "pinia";
import { useGameStore } from "../game-store/game-store.js";
import { createTRPCClient } from "../trpc/client.js";
import { useConfetti } from "./use-confetti.js";

function withPinia(testFunction: () => Promise<void>): TestFunction {
	return async () => {
		setActivePinia(createPinia());

		await testFunction();
	};
}

describe("useConfetti()", () => {
	it(
		"does not call given confetti function when confetti should not be shown",
		withPinia(async () => {
			const trpcClient = createTRPCClient();
			const gameStore = useGameStore(trpcClient);
			gameStore.showConfetti = false;

			const confetti = vi.fn() as unknown as typeof canvasConfetti;
			useConfetti(confetti, trpcClient);

			expect(confetti).not.toHaveBeenCalled();
		})
	);

	it(
		"calls given confetti function when confetti should be shown",
		withPinia(async () => {
			const trpcClient = createTRPCClient();
			const gameStore = useGameStore(trpcClient);
			gameStore.showConfetti = true;

			const confetti = vi.fn().mockResolvedValue(undefined) as unknown as typeof canvasConfetti;
			useConfetti(confetti, trpcClient);

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
