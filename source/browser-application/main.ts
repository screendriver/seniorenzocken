import "./assets/css/tailwind.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { createHead } from "@unhead/vue/client";
import * as Sentry from "@sentry/vue";
import { createSentryPiniaPlugin } from "@sentry/vue";

import App from "./App.vue";
import { router } from "./router.js";

const app = createApp(App);
const pinia = createPinia();
const head = createHead();

if (import.meta.env.PROD) {
	Sentry.init({
		app,
		dsn: "https://a63e7259b4d94e0db547e9934a617ea8@bugsink.82r.de/1",
		integrations: [],
		tracesSampleRate: 0,
	});
}

pinia.use(createSentryPiniaPlugin());

app.use(pinia);
app.use(router);
app.use(head);

app.mount("#application");
