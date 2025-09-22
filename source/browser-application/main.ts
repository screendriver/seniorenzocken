import { createApp } from "vue";
import { createPinia } from "pinia";
import * as Sentry from "@sentry/vue";
import { createSentryPiniaPlugin } from "@sentry/vue";
import { MutationCache, QueryCache, QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import App from "./App.vue";
import { createRouter } from "./router.js";
import { createTRPCClient, trpcClientInjectionKey } from "./trpc/client.js";

const app = createApp(App);
const pinia = createPinia();
const router = createRouter();

if (import.meta.env.PROD) {
	Sentry.init({
		app,
		dsn: "https://a63e7259b4d94e0db547e9934a617ea8@bugsink.82r.de/1",
		integrations: [Sentry.browserTracingIntegration({ router })],
		sendDefaultPii: true,
		tracesSampleRate: 0
	});
}

const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError(error, query) {
			Sentry.captureException(error, {
				extra: { queryKey: query.queryKey }
			});
		}
	}),

	mutationCache: new MutationCache({
		onError(error, variables, onMutateResult, mutation) {
			Sentry.captureException(error, {
				extra: { mutationKey: mutation.options.mutationKey }
			});
		}
	})
});

pinia.use(createSentryPiniaPlugin());

app.provide(trpcClientInjectionKey, createTRPCClient({ isRunningInProduction: import.meta.env.PROD }));
app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, { enableDevtoolsV6Plugin: true, queryClient });

app.mount("#application");
