import { defineStore, type StoreDefinition } from "pinia";
import { createTRPCClient } from "../trpc/client.js";
import type { TRPCClient } from "@trpc/client";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";

export const useTRPCClientStore: StoreDefinition<
	"trpc-client",
	{
		trpcClient: TRPCClient<TRPCApplicationRouter>;
	},
	{
		getTRPCClient(state: { trpcClient: TRPCClient<TRPCApplicationRouter> }): TRPCClient<TRPCApplicationRouter>;
	}
> = defineStore("trpc-client", {
	state() {
		return {
			trpcClient: createTRPCClient(),
		};
	},

	getters: {
		getTRPCClient(state) {
			return state.trpcClient;
		},
	},
});
