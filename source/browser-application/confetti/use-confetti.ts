import { watchEffect } from "vue";
import type canvasConfetti from "canvas-confetti";
import { storeToRefs } from "pinia";
import type { TRPCClient } from "@trpc/client";
import { useGameStore } from "../game-store/game-store.js";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";

export function useConfetti(confetti: typeof canvasConfetti, trpcClient: TRPCClient<TRPCApplicationRouter>): void {
	const gameStore = useGameStore(trpcClient);
	const { showConfetti } = storeToRefs(gameStore);

	watchEffect(() => {
		if (!showConfetti.value) {
			return;
		}

		async function runConfetti(): Promise<void> {
			await confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 }
			});

			showConfetti.value = false;
		}

		void runConfetti();
	});
}
