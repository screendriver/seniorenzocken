import { createTRPCClient as createRealTRPCClient, httpLink, type TRPCClient } from "@trpc/client";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";

export function createTRPCClient(): TRPCClient<TRPCApplicationRouter> {
	return createRealTRPCClient<TRPCApplicationRouter>({
		links: [httpLink({ url: "/api/trpc" })]
	});
}
