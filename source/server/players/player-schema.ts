import { array, integer, minValue, nonEmpty, number, object, pipe, string, type InferOutput } from "valibot";

const nonEmptyStringSchema = pipe(string(), nonEmpty());
const integerSchema = pipe(number(), integer(), minValue(0));

export const playerSchema = object({
	playerId: pipe(number(), integer(), minValue(1)),
	firstName: nonEmptyStringSchema,
	lastName: nonEmptyStringSchema,
	nickname: nonEmptyStringSchema,
	totalPoints: integerSchema,
	totalGamesCount: integerSchema
});

export type Player = InferOutput<typeof playerSchema>;

export const playersSchema = pipe(array(playerSchema), nonEmpty());

export type Players = InferOutput<typeof playersSchema>;
