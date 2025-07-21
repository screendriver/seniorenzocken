import { createTRPCClient as createRealTRPCClient, httpLink, type TRPCClient } from "@trpc/client";
import type { TRPCApplicationRouter } from "../../shared/trpc.ts";

export function createTRPCClient(): TRPCClient<TRPCApplicationRouter> {
	return createRealTRPCClient<TRPCApplicationRouter>({
		links: [httpLink({ url: "/api/trpc" })],
	});
}
