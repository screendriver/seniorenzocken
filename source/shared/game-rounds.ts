import { strictTuple, array, type InferOutput } from "valibot";
import { notPersistedTeamSchema } from "./team.ts";

export const gameRoundSchema = strictTuple([notPersistedTeamSchema, notPersistedTeamSchema]);

export const gameRoundsSchema = array(strictTuple([notPersistedTeamSchema, notPersistedTeamSchema]));

export type GameRound = InferOutput<typeof gameRoundSchema>;

export type GameRounds = InferOutput<typeof gameRoundsSchema>;
