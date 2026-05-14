import { createContext, useContext, type FunctionComponent, type ReactNode } from "react";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { StoreApi } from "zustand";
import type { GameStoreState } from "../game-store/game-store.js";
import type { FireAndForgetExecutor } from "../asynchronous-effects/fire-and-forget-executor.js";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";

type WindowEventName = "keydown" | "mousedown" | "mousemove";

export type TimeoutId = ReturnType<typeof setTimeout> | number;

export type AuthenticationCredentials = {
	readonly username: string;
	readonly password: string;
};

export type AuthenticationApi = {
	readonly authenticate: (credentials: AuthenticationCredentials) => Promise<Response>;
	readonly logout: () => Promise<Response>;
};

export type AudioElementFactory = {
	readonly createAudioElement: (source: string) => HTMLAudioElement;
};

export type BrowserRuntime = {
	readonly requestWakeLockScreen: () => Promise<void>;
	readonly setTimeout: (callback: () => void, delayMilliseconds: number) => TimeoutId;
	readonly clearTimeout: (timeoutId: TimeoutId) => void;
	readonly addWindowEventListener: (eventName: WindowEventName, listener: () => void) => void;
	readonly removeWindowEventListener: (eventName: WindowEventName, listener: () => void) => void;
	readonly isOnline: () => boolean;
	readonly getRandomFraction: () => number;
};

export type ApplicationContext = {
	readonly authenticationApi: AuthenticationApi;
	readonly audioElementFactory: AudioElementFactory;
	readonly browserRuntime: BrowserRuntime;
	readonly fireAndForgetExecutor: FireAndForgetExecutor;
	readonly gameStore: StoreApi<GameStoreState>;
	readonly trpc: TRPCOptionsProxy<TRPCApplicationRouter>;
};

type ApplicationContextProviderProperties = {
	readonly applicationContext: ApplicationContext;
	readonly children: ReactNode;
};

const ApplicationReactContext = createContext<ApplicationContext | null>(null);

export const ApplicationContextProvider: FunctionComponent<ApplicationContextProviderProperties> = (properties) => {
	const { applicationContext, children } = properties;

	return <ApplicationReactContext.Provider value={applicationContext}>{children}</ApplicationReactContext.Provider>;
};

export function useApplicationContext(): ApplicationContext {
	const applicationContextOrNull = useContext(ApplicationReactContext);

	if (applicationContextOrNull === null) {
		throw new Error("Could not use application context because no provider value was provided");
	}

	return applicationContextOrNull;
}
