import {
	tuple,
	object,
	union,
	literal,
	string,
	minLength,
	minValue,
	type Output,
	number,
	boolean,
	transform,
} from "valibot";

const teamSchema = object({
	teamNumber: union([literal(1), literal(2)]),
	teamName: string([minLength(1)]),
	currentGamePoints: number([minValue(0)]),
	totalGamePoints: number([minValue(0)]),
	isStretched: boolean(),
});

export const teamsQueryStringSchema = tuple([teamSchema, teamSchema]);

export const includeStretchedQueryStringSchema = transform(string(), (input) => {
	return input === "true";
});

export type Teams = Output<typeof teamsQueryStringSchema>;
