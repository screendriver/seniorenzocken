import "@tanstack/vue-query";

type QueryKey = ["session" | "players" | "currentGameRound", ...(readonly unknown[])];

declare module "@tanstack/vue-query" {
	interface Register {
		queryKey: QueryKey;
	}
}
