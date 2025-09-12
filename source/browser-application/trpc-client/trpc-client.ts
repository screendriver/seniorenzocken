import type { InjectionKey } from "vue";
import type { TRPCClient } from "@trpc/client";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";

export const trpcCilentInjectionKey = Symbol("tRPC-client") as InjectionKey<TRPCClient<TRPCApplicationRouter>>;
