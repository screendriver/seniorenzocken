import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { deleteCookie, getCookie } from "hono/cookie";
import { just, nothing, of } from "true-myth/maybe";
import type { SessionRepository } from "../session/session-repository.js";
import type { HonoEnvironment } from "../hono-environment.js";

export type SessionMiddlewareDepdendencies = {
	readonly sessionRepository: SessionRepository;
};

const cookieName = "session_token";

export function sessionMiddleware(dependencies: SessionMiddlewareDepdendencies): MiddlewareHandler<HonoEnvironment> {
	const { sessionRepository } = dependencies;

	return createMiddleware(async (context, next) => {
		context.set("sessionToken", nothing());
		const existingSessionToken = of(getCookie(context, cookieName));

		if (existingSessionToken.isNothing) {
			return next();
		}

		const sessionResult = await sessionRepository.getSession(existingSessionToken.value);

		if (sessionResult.isErr) {
			deleteCookie(context, cookieName);

			return next();
		}

		context.set("sessionToken", just(sessionResult.value.token));

		return next();
	});
}
