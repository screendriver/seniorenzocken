import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema.ts";

const honoServer = new Hono();

const yoga = createYoga({ schema });

honoServer.use("/graphql", async (context) => {
	return yoga.handle(context.req.raw, {});
});

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
