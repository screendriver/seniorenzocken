import type { Context } from "hono";
import type { Maybe } from "true-myth/maybe";
import type { HonoEnvironment } from "../hono-environment.js";

export type TRPCRouterContext = {
	readonly sessionToken: Maybe<string>;
};

type CreateContextOptions = {
	readonly honoContext: Context<HonoEnvironment>;
};

export function createTRPCContext(options: CreateContextOptions): TRPCRouterContext {
	const { honoContext } = options;

	return { sessionToken: honoContext.get("sessionToken") };
}
