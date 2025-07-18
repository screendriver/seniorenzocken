import { union, literal, type InferOutput } from "valibot";

export const gamePointsPerRound = [0, 2, 3, 4] as const;

export const gamePointsPerRoundSchema = union(
	gamePointsPerRound.map((gamePointsPerRoundValue) => {
		return literal(gamePointsPerRoundValue);
	}),
);

export type GamePointsPerRound = InferOutput<typeof gamePointsPerRoundSchema>;

export const matchTotalGamePoints = [...gamePointsPerRound, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;

export const matchTotalGamePointsSchema = union(
	matchTotalGamePoints.map((matchTotalGamePoint) => {
		return literal(matchTotalGamePoint);
	}),
);

export type MatchTotalGamePoints = InferOutput<typeof matchTotalGamePointsSchema>;
