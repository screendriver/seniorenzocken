import { useEffect } from "react";
import type canvasConfetti from "canvas-confetti";
import { useApplicationContext } from "../context/app-context.js";

export function shouldLaunchConfetti(previousShowConfetti: boolean, currentShowConfetti: boolean): boolean {
	return !previousShowConfetti && currentShowConfetti;
}

export function useConfetti(confetti: typeof canvasConfetti): void {
	const applicationContext = useApplicationContext();
	const { gameStore } = applicationContext;

	useEffect(() => {
		async function launchConfetti(): Promise<void> {
			await confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 }
			});

			gameStore.setState({ showConfetti: false });
		}

		const unsubscribe = gameStore.subscribe((state, previousState) => {
			if (!shouldLaunchConfetti(previousState.showConfetti, state.showConfetti)) {
				return;
			}

			void launchConfetti();
		});

		return unsubscribe;
	}, [confetti, gameStore]);
}
