import { initTRPC, TRPCError } from "@trpc/server";
import type { TRPCRouterContext } from "./context.js";

export type TRPCRouter = ReturnType<typeof createTrpcRouter>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- tRPC works with type inference
export function createTrpcRouter() {
	const trpc = initTRPC.context<TRPCRouterContext>().create();

	const protectedProcedure = trpc.procedure.use(async (options) => {
		return options.ctx.sessionToken.match({
			async Just(sessionToken) {
				return options.next({ ctx: { sessionToken } });
			},
			Nothing() {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
		});
	});

	return { router: trpc.router, publicProcedure: trpc.procedure, protectedProcedure };
}
