import { createTRPCClient, httpLink, type TRPCClient } from "@trpc/client";
import type { InjectionKey } from "vue";
import type { TRPCRouter } from "../../shared/trpc.ts";

export const trpcClientInjectionKey: InjectionKey<TRPCClient<TRPCRouter>> = Symbol();

export function createTRpcClient(serverUrl: URL) {
	return createTRPCClient<TRPCRouter>({
		links: [
			httpLink({
				url: serverUrl,
			}),
		],
	});
}
