import "@tanstack/vue-query";

type QueryKey = [...(readonly unknown[])];

declare module "@tanstack/vue-query" {
	interface Register {
		queryKey: QueryKey;
	}
}
