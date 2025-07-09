import type { createTrpcRouter } from "../server/trpc-router.ts";

export type TRPCRouter = ReturnType<typeof createTrpcRouter>;
