import { strictTuple, integer, minValue, nonEmpty, number, object, pipe, string, type InferOutput } from "valibot";

const nonEmptyStringSchema = pipe(string(), nonEmpty());

export const sessionSchema = object({
	token: nonEmptyStringSchema
});

export type Session = InferOutput<typeof sessionSchema>;

const currentGameRoundSessionSchema = object({
	playerNickname: nonEmptyStringSchema,
	playerFirstName: nonEmptyStringSchema,
	teamId: pipe(number(), integer(), minValue(1))
});

export const currentGameRoundSessionsSchema = strictTuple([
	currentGameRoundSessionSchema,
	currentGameRoundSessionSchema,
	currentGameRoundSessionSchema,
	currentGameRoundSessionSchema
]);

export type CurrentGameRoundSessions = InferOutput<typeof currentGameRoundSessionsSchema>;
