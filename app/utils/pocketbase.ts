import type PocketBase from "pocketbase";

export const pocketBaseInjectionKey = Symbol() as InjectionKey<PocketBase>;
