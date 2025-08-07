import { initTRPC } from "@trpc/server";

export type TRPCRouter = ReturnType<typeof createTrpcRouter>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- tRPC works with type inference
export function createTrpcRouter() {
	const trpc = initTRPC.create();

	return { router: trpc.router, publicProcedure: trpc.procedure };
}
