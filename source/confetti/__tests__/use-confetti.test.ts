import type canvasConfetti from "canvas-confetti";
import { createPinia, setActivePinia } from "pinia";
import { test, expect, beforeEach, vi } from "vitest";
import { useGameStore } from "../../game-store/game-store";
import { useConfetti } from "../use-confetti";

beforeEach(() => {
	setActivePinia(createPinia());
});

test("useConfetti() does not call given confetti function when confetti should not be shown", async () => {
	const gameStore = useGameStore();
	gameStore.showConfetti = false;

	const confetti = vi.fn() as unknown as typeof canvasConfetti;
	useConfetti(confetti);

	expect(confetti).not.toHaveBeenCalled();
});

test("useConfetti() calls given confetti function when confetti should be shown", async () => {
	const gameStore = useGameStore();
	gameStore.showConfetti = true;

	const confetti = vi.fn().mockResolvedValue(undefined) as unknown as typeof canvasConfetti;
	useConfetti(confetti);

	await confetti();

	expect(confetti).toHaveBeenCalledWith({
		particleCount: 100,
		spread: 70,
		origin: { y: 0.6 },
	});
	expect(gameStore.showConfetti).toBe(false);
});
