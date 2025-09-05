import { nonEmpty, object, pipe, string, type InferOutput } from "valibot";

export const sessionSchema = object({
	token: pipe(string(), nonEmpty())
});

export type Session = InferOutput<typeof sessionSchema>;
