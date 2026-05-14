import { createTRPCClient as createRealTRPCClient, httpLink, type TRPCClient, loggerLink } from "@trpc/client";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";

type TRPCClientOptions = {
	readonly isRunningInProduction: boolean;
};

export function createTRPCClient(options: TRPCClientOptions): TRPCClient<TRPCApplicationRouter> {
	return createRealTRPCClient<TRPCApplicationRouter>({
		links: [
			loggerLink({
				enabled() {
					return !options.isRunningInProduction;
				}
			}),
			httpLink({ url: "/api/trpc" })
		]
	});
}
