import * as Sentry from "@sentry/node";

Sentry.init({
	dsn: "https://a63e7259b4d94e0db547e9934a617ea8@bugsink.82r.de/1",
	integrations: [],
	sendDefaultPii: true,
	tracesSampleRate: 0
});
