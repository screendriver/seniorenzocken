import "@tanstack/vue-query";

type QueryKey = ["players", ...(readonly unknown[])];

declare module "@tanstack/vue-query" {
	interface Register {
		queryKey: QueryKey;
	}
}
