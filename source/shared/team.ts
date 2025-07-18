import { object, union, literal, string, pipe, nonEmpty, boolean, type InferOutput } from "valibot";
import { gamePointsPerRoundSchema, matchTotalGamePointsSchema } from "./game-points.ts";

export const notPersistedTeamSchema = object({
	teamNumber: union([literal(1), literal(2)]),
	name: pipe(string(), nonEmpty()),
	currentRoundGamePoints: gamePointsPerRoundSchema,
	matchTotalGamePoints: matchTotalGamePointsSchema,
	isStretched: boolean(),
});

export type NotPersistedTeam = InferOutput<typeof notPersistedTeamSchema>;
