import type { createTrpcApplicationRouter } from "../server/trpc/application-router.ts";

export type TRPCApplicationRouter = ReturnType<typeof createTrpcApplicationRouter>;
