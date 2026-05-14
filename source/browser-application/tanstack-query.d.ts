import "@tanstack/react-query";

type QueryKey = readonly unknown[];

declare module "@tanstack/react-query" {
	interface Register {
		queryKey: QueryKey;
	}
}
