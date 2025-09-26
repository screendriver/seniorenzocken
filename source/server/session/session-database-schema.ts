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
	picklist,
	type InferOutput
} from "valibot";

const nonEmptyStringSchema = pipe(string(), nonEmpty());

export const sessionDatabaseSelectSchema = object({
	token: nonEmptyStringSchema
});

export type SessionDatabaseSelect = InferOutput<typeof sessionDatabaseSelectSchema>;

const idSchema = pipe(number(), integer(), minValue(1));

const currentGameRoundSessionDatabaseSelectSchema = object({
	playerId: idSchema,
	playerNickname: nonEmptyStringSchema,
	playerFirstName: nonEmptyStringSchema,
	teamId: idSchema,
	gamePoints: pipe(nullable(pipe(number(), integer(), minValue(0))), transform<number | null, Maybe<number>>(of)),
	hasPreviousGameRounds: pipe(
		picklist([0, 1]),
		transform((hasPreviousRounds) => {
			return hasPreviousRounds === 1;
		})
	)
});

export type CurrentGameRoundSessionDatabaseSelect = InferOutput<typeof currentGameRoundSessionDatabaseSelectSchema>;

export const currentGameRoundSessionsDatabaseSelectSchema = pipe(
	array(currentGameRoundSessionDatabaseSelectSchema),
	minLength(1)
);

export type CurrentGameRoundSessionsDatabaseSelect = InferOutput<typeof currentGameRoundSessionsDatabaseSelectSchema>;
