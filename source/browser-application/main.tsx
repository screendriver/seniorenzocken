import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import ky from "ky";
import type { TRPCApplicationRouter } from "../server-shared/trpc-application-router.js";
import { createRouter } from "./router.js";
import { createTRPCClient } from "./trpc/client.js";
import { createGameStore } from "./game-store/game-store.js";
import { createFireAndForgetExecutor } from "./asynchronous-effects/fire-and-forget-executor.js";
import {
	ApplicationContextProvider,
	type ApplicationContext,
	type BrowserRuntime,
	type AuthenticationCredentials
} from "./context/app-context.js";
import "./assets/css/tailwind.css";

const trpcClient = createTRPCClient({ isRunningInProduction: import.meta.env.PROD });
const gameStore = createGameStore(trpcClient);

const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError(error, query) {
			Sentry.captureException(error, { extra: { queryKey: query.queryKey } });
		}
	}),
	mutationCache: new MutationCache({
		onError(error, _variables, _onMutateResult, mutation) {
			const { mutationKey } = mutation.options;
			if (mutationKey?.includes("authenticate") === true) {
				return;
			}
			Sentry.captureException(error, { extra: { mutationKey } });
		}
	})
});
const trpc = createTRPCOptionsProxy<TRPCApplicationRouter>({
	client: trpcClient,
	queryClient
});
const router = createRouter({ trpc, queryClient });
const fireAndForgetExecutor = createFireAndForgetExecutor({
	logError(_message: string, error: unknown) {
		Sentry.captureException(error);
	}
});

const browserRuntime: BrowserRuntime = {
	async requestWakeLockScreen() {
		await navigator.wakeLock.request("screen");
	},
	setTimeout(callback, delayMilliseconds) {
		return setTimeout(callback, delayMilliseconds);
	},
	clearTimeout(timeoutId) {
		clearTimeout(timeoutId);
	},
	addWindowEventListener(eventName, listener) {
		addEventListener(eventName, listener);
	},
	removeWindowEventListener(eventName, listener) {
		removeEventListener(eventName, listener);
	},
	isOnline() {
		return navigator.onLine;
	},
	getRandomFraction() {
		const randomValues = new Uint32Array(1);
		crypto.getRandomValues(randomValues);
		return (randomValues[0] ?? 0) / (2 ** 32 - 1);
	}
};

const applicationContext: ApplicationContext = {
	authenticationApi: {
		async authenticate(credentials: AuthenticationCredentials) {
			return ky.post("/api/authenticate", { json: credentials });
		},
		async logout() {
			return ky.post("/api/logout");
		}
	},
	audioElementFactory: {
		createAudioElement(source: string) {
			return new Audio(source);
		}
	},
	browserRuntime,
	fireAndForgetExecutor,
	gameStore,
	trpc
};

if (import.meta.env.PROD) {
	Sentry.init({
		dsn: "https://a63e7259b4d94e0db547e9934a617ea8@bugsink.82r.de/1",
		sendDefaultPii: true,
		tracesSampleRate: 0
	});
}

const rootElement = document.querySelector("#application");

if (rootElement === null) {
	throw new Error("Could not mount application because '#application' was not found");
}

createRoot(rootElement).render(
	<QueryClientProvider client={queryClient}>
		<ApplicationContextProvider applicationContext={applicationContext}>
			<RouterProvider router={router} />
		</ApplicationContextProvider>
		{import.meta.env.DEV ? <ReactQueryDevtools /> : null}
	</QueryClientProvider>
);
