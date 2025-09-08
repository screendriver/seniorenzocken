import "@tanstack/vue-query";

type QueryKey = ["players" | "currentGameRound", ...(readonly unknown[])];

declare module "@tanstack/vue-query" {
	interface Register {
		queryKey: QueryKey;
	}
}
