import { initTRPC } from "@trpc/server";
import type { TRPCRouterContext } from "./context.js";

export type TRPCRouter = ReturnType<typeof createTrpcRouter>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- tRPC works with type inference
export function createTrpcRouter() {
	const trpc = initTRPC.context<TRPCRouterContext>().create();

	return { router: trpc.router, publicProcedure: trpc.procedure };
}
