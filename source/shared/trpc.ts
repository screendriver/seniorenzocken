import type { createTrpcRouter } from "../server/trpc.ts";

export type TRPCRouter = ReturnType<typeof createTrpcRouter>;
