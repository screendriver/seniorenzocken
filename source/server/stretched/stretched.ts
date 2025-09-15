import type { MatchTotalGamePoints } from "../../shared/game-points.js";

export function isStretched(matchTotalGamePoints: MatchTotalGamePoints): boolean {
	return matchTotalGamePoints >= 12;
}
