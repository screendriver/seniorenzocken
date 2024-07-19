export const availableGamePoints = [0, 2, 3, 4] as const;

export type GamePoint = (typeof availableGamePoints)[number];

export function hasReachedMaximumGamePoint(team1GamePoint: Ref<GamePoint>, team2GamePoint: Ref<GamePoint>): boolean {
	return team1GamePoint.value == 4 || team2GamePoint.value == 4;
}
