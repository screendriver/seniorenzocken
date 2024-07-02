import type canvasConfetti from "canvas-confetti";

export function useConfetti(confetti: typeof canvasConfetti) {
	const gameStore = useGameStore();
	const { showConfetti } = storeToRefs(gameStore);

	watchEffect(async () => {
		if (!showConfetti.value) {
			return;
		}

		await confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
		});

		showConfetti.value = false;
	});
}
