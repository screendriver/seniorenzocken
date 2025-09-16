import type { InjectionKey } from "vue";
import { createTRPCClient as createRealTRPCClient, httpLink, type TRPCClient } from "@trpc/client";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";

export const trpcClientInjectionKey = Symbol("tRPC-client") as InjectionKey<TRPCClient<TRPCApplicationRouter>>;

export function createTRPCClient(): TRPCClient<TRPCApplicationRouter> {
	return createRealTRPCClient<TRPCApplicationRouter>({
		links: [httpLink({ url: "/api/trpc" })]
	});
}
