import type { Context } from "hono";
import type { Maybe } from "true-myth/maybe";
import type { HonoEnvironment } from "../hono-environment.js";
import type { SessionDatabaseSelect } from "../session/session-database-schema.js";

export type TRPCRouterContext = {
	readonly session: Maybe<SessionDatabaseSelect>;
};

type CreateContextOptions = {
	readonly honoContext: Context<HonoEnvironment>;
};

export function createTRPCContext(options: CreateContextOptions): TRPCRouterContext {
	const { honoContext } = options;

	return { session: honoContext.get("session") };
}
