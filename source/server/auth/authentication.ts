import { createFactory } from "hono/factory";
import { getConnInfo } from "@hono/node-server/conninfo";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { fromPromise } from "true-myth/task";
import { safeParse } from "valibot";
import type { HonoEnvironment } from "../hono-environment.js";
import type { SessionRepository } from "../session/session-repository.js";
import { authenticationSchema } from "./authentication-schema.js";

const factory = createFactory<HonoEnvironment>();

export type AuthenticateHandlersOptions = {
	readonly sessionRepository: SessionRepository;
	readonly seniorenzockenUsername: string;
	readonly seniorenzockenPassword: string;
	readonly isRunningInProduction: boolean;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Hono infers all types
export function createAuthenticateHandlers(options: AuthenticateHandlersOptions) {
	const { sessionRepository, seniorenzockenUsername, seniorenzockenPassword, isRunningInProduction } = options;

	return factory.createHandlers(async (context) => {
		const jsonPayload = await fromPromise(context.req.json<unknown>());

		if (jsonPayload.isErr) {
			throw new HTTPException(400);
		}

		const jsonPayloadParseResult = safeParse(authenticationSchema, jsonPayload.value);

		if (!jsonPayloadParseResult.success) {
			throw new HTTPException(400);
		}

		if (
			jsonPayloadParseResult.output.username !== seniorenzockenUsername ||
			jsonPayloadParseResult.output.password !== seniorenzockenPassword
		) {
			throw new HTTPException(401, { message: "Invalid credentials" });
		}

		const connectionInfo = getConnInfo(context);
		const userAgent = context.req.header("User-Agent");

		const sessionResult = await sessionRepository.createSession({
			ipAddress: connectionInfo.remote.address,
			userAgent
		});

		return sessionResult.match({
			Ok(sessionData) {
				setCookie(context, "session_token", sessionData.token, {
					httpOnly: true,
					sameSite: "lax",
					secure: isRunningInProduction
				});

				return context.json({ success: true });
			},
			Err() {
				throw new HTTPException(500);
			}
		});
	});
}
