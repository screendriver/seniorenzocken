import { nonEmpty, object, pipe, string } from "valibot";

export const authenticationSchema = object({
	username: pipe(string(), nonEmpty()),
	password: pipe(string(), nonEmpty())
});
