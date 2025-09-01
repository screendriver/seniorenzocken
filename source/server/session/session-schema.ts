import { of } from "true-myth/maybe";
import { nonEmpty, nullable, object, pipe, string, transform, type InferOutput } from "valibot";

const nullableNonEmptyStringSchema = pipe(
	nullable(pipe(string(), nonEmpty())),
	// eslint-disable-next-line functional/prefer-tacit -- otherwise compile errors
	transform((value) => {
		return of(value);
	})
);

export const sessionSchema = object({
	token: pipe(string(), nonEmpty()),
	ipAddress: nullableNonEmptyStringSchema,
	userAgent: nullableNonEmptyStringSchema
});

export type Session = InferOutput<typeof sessionSchema>;
