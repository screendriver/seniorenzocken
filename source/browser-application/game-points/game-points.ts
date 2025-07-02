import type { Ref } from "vue";
import * as v from "valibot";

export const availableGamePoints = [0, 2, 3, 4] as const;

export type GamePoint = (typeof availableGamePoints)[number];

export const gamePointsSchema = v.union([
	v.literal(0),
	v.literal(2),
	v.literal(3),
	v.literal(4),
	v.literal(5),
	v.literal(6),
	v.literal(7),
	v.literal(8),
	v.literal(9),
	v.literal(10),
	v.literal(11),
	v.literal(12),
	v.literal(13),
	v.literal(14),
	v.literal(15),
	v.literal(16),
	v.literal(17),
	v.literal(18),
]);

export type GamePoints = v.InferOutput<typeof gamePointsSchema>;

export function hasReachedMaximumGamePoint(team1GamePoint: Ref<GamePoint>, team2GamePoint: Ref<GamePoint>): boolean {
	return team1GamePoint.value == 4 || team2GamePoint.value == 4;
}
