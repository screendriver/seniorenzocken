import { defineStore } from "pinia";
import { createTRPCClient } from "../trpc/client";

export const useTRPCClientStore = defineStore("trpc-client", {
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
