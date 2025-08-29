import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { of } from "true-myth/maybe";
import { match, P } from "ts-pattern";

type ValidateCredentialsOptions = AuthenticationMiddlewareOptions & {
	readonly encodedCredentials: string;
};

function validateCredentials(options: ValidateCredentialsOptions): boolean {
	const { encodedCredentials, seniorenzockenUsername, seniorenzockenPassword } = options;
	const decoded = Buffer.from(encodedCredentials, "base64").toString("utf-8");

	const [username, password] = decoded.split(":");

	return username === seniorenzockenUsername && password === seniorenzockenPassword;
}

export type AuthenticationMiddlewareOptions = {
	readonly seniorenzockenUsername: string;
	readonly seniorenzockenPassword: string;
};

export function authenticationMiddleware(options: AuthenticationMiddlewareOptions): MiddlewareHandler {
	const { seniorenzockenUsername, seniorenzockenPassword } = options;

	return createMiddleware(async (context, next) => {
		const rawAuthorizationHeader = context.req.header("Authorization");

		const isAuthenticated = of(rawAuthorizationHeader)
			.map((authorizationHeader) => {
				const [type, credentials] = authorizationHeader.split(" ");

				return match([type, credentials])
					.with(["Basic", P.select(P.string)], (encodedCredentials) => {
						return validateCredentials({
							encodedCredentials,
							seniorenzockenUsername,
							seniorenzockenPassword
						});
					})
					.otherwise(() => {
						return false;
					});
			})
			.unwrapOr(false);

		if (!isAuthenticated) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		await next();
	});
}
