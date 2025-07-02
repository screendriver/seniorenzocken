import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const honoServer = new Hono();

honoServer.use("*", serveStatic({ root: "./browser-application" }));

serve(
	{
		fetch: honoServer.fetch,
		port: 4000,
	},
	() => {
		console.info("Server is running on http://localhost:4000");
	},
);
