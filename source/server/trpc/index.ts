import { initTRPC } from "@trpc/server";

export type TRPCRouter = ReturnType<typeof createTrpcRouter>;

export function createTrpcRouter() {
	const trpc = initTRPC.create();

	return { router: trpc.router, publicProcedure: trpc.procedure };
}
