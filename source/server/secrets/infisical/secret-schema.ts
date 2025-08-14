import { object, pipe, string, nonEmpty, type InferOutput } from "valibot";

export const secretSchema = object({
	secretValue: pipe(string(), nonEmpty())
});

export type Secret = InferOutput<typeof secretSchema>;
