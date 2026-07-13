import type { Maybe } from "true-myth/maybe";
import type { HonoEnvironment } from "../hono-environment.js";
import type { SessionDatabaseSelect } from "../session/session-database-schema.js";

export type TRPCRouterContext = {
	readonly session: Maybe<SessionDatabaseSelect>;
};

type HonoContextWithSession = {
	get: (sessionKey: keyof HonoEnvironment["Variables"]) => HonoEnvironment["Variables"]["session"];
};

type CreateContextOptions = {
	readonly honoContext: HonoContextWithSession;
};

export function createTRPCContext(options: CreateContextOptions): TRPCRouterContext {
	const { honoContext } = options;

	return { session: honoContext.get("session") };
}
