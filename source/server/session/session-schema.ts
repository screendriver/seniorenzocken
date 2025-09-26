import { of, type Maybe } from "true-myth/maybe";
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
	transform,
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
	gamePoints: pipe(nullable(pipe(number(), integer(), minValue(0))), transform<number | null, Maybe<number>>(of))
});

export type CurrentGameRoundSession = InferOutput<typeof currentGameRoundSessionSchema>;

export const currentGameRoundSessionsSchema = pipe(array(currentGameRoundSessionSchema), minLength(1));

export type CurrentGameRoundSessions = InferOutput<typeof currentGameRoundSessionsSchema>;
