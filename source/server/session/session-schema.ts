import {
	array,
	minLength,
	integer,
	minValue,
	nonEmpty,
	number,
	object,
	pipe,
	string,
	nullable,
	type InferOutput
} from "valibot";

const nonEmptyStringSchema = pipe(string(), nonEmpty());

export const sessionSchema = object({
	token: nonEmptyStringSchema
});

export type Session = InferOutput<typeof sessionSchema>;

const idSchema = pipe(number(), integer(), minValue(1));

const currentGameRoundSessionSchema = object({
	playerId: idSchema,
	playerNickname: nonEmptyStringSchema,
	playerFirstName: nonEmptyStringSchema,
	teamId: idSchema,
	gamePoints: nullable(pipe(number(), integer(), minValue(0)), 0)
});

export const currentGameRoundSessionsSchema = pipe(array(currentGameRoundSessionSchema), minLength(1));

export type CurrentGameRoundSessions = InferOutput<typeof currentGameRoundSessionsSchema>;
