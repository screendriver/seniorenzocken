import { object, literal, string, pipe, nonEmpty, boolean, type InferOutput } from "valibot";
import { gamePointsPerRoundSchema, matchTotalGamePointsSchema } from "./game-points.ts";

const notPersistedTeamSchema = object({
	name: pipe(string(), nonEmpty()),
	currentRoundGamePoints: gamePointsPerRoundSchema,
	matchTotalGamePoints: matchTotalGamePointsSchema,
	isStretched: boolean(),
});

export const notPersistedTeam1Schema = object({
	...notPersistedTeamSchema.entries,
	teamNumber: literal(1),
});

export const notPersistedTeam2Schema = object({
	...notPersistedTeamSchema.entries,
	teamNumber: literal(2),
});

export type NotPersistedTeam1 = InferOutput<typeof notPersistedTeam1Schema>;
export type NotPersistedTeam2 = InferOutput<typeof notPersistedTeam2Schema>;
export type NotPersistedTeam = NotPersistedTeam1 | NotPersistedTeam2;
