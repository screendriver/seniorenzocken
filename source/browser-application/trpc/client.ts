import { createTRPCClient as createRealTRPCClient, httpLink, type TRPCClient } from "@trpc/client";
import type { TRPCRouter } from "../../shared/trpc.ts";

export function createTRPCClient(): TRPCClient<TRPCRouter> {
	return createRealTRPCClient<TRPCRouter>({
		links: [httpLink({ url: "/api/trpc" })],
	});
}
