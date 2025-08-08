import { defineStore, type StoreDefinition } from "pinia";
import type { TRPCClient } from "@trpc/client";
import { createTRPCClient } from "../trpc/client.js";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";

export const useTRPCClientStore: StoreDefinition<
	"trpc-client",
	{
		trpcClient: TRPCClient<TRPCApplicationRouter>;
	}
> = defineStore("trpc-client", {
	state() {
		return {
			trpcClient: createTRPCClient()
		};
	}
});
