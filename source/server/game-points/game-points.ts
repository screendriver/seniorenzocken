import { union, literal, type InferOutput } from "valibot";

const gamePointsPerRoundLiterals = [0, 2, 3, 4] as const;

export const matchTotalGamePoints = [
	...gamePointsPerRoundLiterals,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
] as const;

export const gamePointsPerRoundSchema = union(
	gamePointsPerRoundLiterals.map((gamePointsPerRoundLiteral) => {
		return literal(gamePointsPerRoundLiteral);
	}),
);

export type GamePointsPerRound = InferOutput<typeof gamePointsPerRoundSchema>;

export const matchTotalGamePointsSchema = union(
	matchTotalGamePoints.map((matchTotalGamePoint) => {
		return literal(matchTotalGamePoint);
	}),
);

export type MatchTotalGamePoints = InferOutput<typeof matchTotalGamePointsSchema>;
