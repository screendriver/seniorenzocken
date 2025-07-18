import type { MatchTotalGamePoints } from "../../shared/game-points.ts";

export function isStretched(matchTotalGamePoints: MatchTotalGamePoints): boolean {
	return matchTotalGamePoints >= 12;
}
