import { Hono } from "hono";
import { serve, type ServerType } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { type CORSOptions, createYoga } from "graphql-yoga";
import { schema } from "./graphql/graphql-server-schema.ts";

type ServerOptions = {
	readonly cors: CORSOptions;
};

export function createServer(options: ServerOptions): ServerType {
	const { cors } = options;
	const honoServer = new Hono();

	const yoga = createYoga({ cors, schema });

	honoServer.use("/graphql", async (context) => {
		return yoga.handle(context.req.raw, {});
	});

	honoServer.use("/*", serveStatic({ root: "./browser-application" }));

	honoServer.get("*", serveStatic({ path: "./browser-application/index.html" }));

	return serve(
		{
			fetch: honoServer.fetch,
			port: 4000,
		},
		() => {
			console.info("Server is running on http://localhost:4000");
		},
	);
}
