import { strictTuple, array, object, boolean, type InferOutput } from "valibot";
import { notPersistedTeam1Schema, notPersistedTeam2Schema } from "./team.js";

const hasWonGameRoundSchema = boolean();

export const gameRoundSchema = strictTuple([
	object({ team: notPersistedTeam1Schema, hasWonGameRound: hasWonGameRoundSchema }),
	object({ team: notPersistedTeam2Schema, hasWonGameRound: hasWonGameRoundSchema }),
]);

export type GameRound = InferOutput<typeof gameRoundSchema>;

export const gameRoundsSchema = array(gameRoundSchema);

export type GameRounds = InferOutput<typeof gameRoundsSchema>;
