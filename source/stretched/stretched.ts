import type { GamePoints } from "../game-points/game-points";

export function isStretched(totalGamePoints: GamePoints): boolean {
	return totalGamePoints >= 12;
}
