import { createFactory } from "hono/factory";
import { getCookie, deleteCookie } from "hono/cookie";
import { isUndefined } from "@sindresorhus/is";
import type { HonoEnvironment } from "../hono-environment.js";
import type { SessionRepository } from "../session/session-repository.js";
import { cookieName } from "./cookie-name.js";

const factory = createFactory<HonoEnvironment>();

export type LogoutHandlersOptions = {
	readonly sessionRepository: SessionRepository;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Hono infers all types
export function createLogoutHandlers(options: LogoutHandlersOptions) {
	const { sessionRepository } = options;

	return factory.createHandlers(async (context) => {
		const sessionToken = getCookie(context, cookieName);

		if (isUndefined(sessionToken)) {
			return context.body(null, 400);
		}

		await sessionRepository.deleteSession(sessionToken);

		deleteCookie(context, cookieName);

		return context.body(null, 204);
	});
}
