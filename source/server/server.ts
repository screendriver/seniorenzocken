import { Hono } from "hono";
import { serve, type ServerType } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { type CORSOptions, createYoga } from "graphql-yoga";
import { createGraphQLServerSchema } from "./graphql/graphql-server-schema.ts";
import type { Database } from "./database/database.ts";

type ServerOptions = {
	readonly cors: CORSOptions;
	readonly database: Database;
};

export function createServer(options: ServerOptions): ServerType {
	const { cors, database } = options;
	const honoServer = new Hono();

	const graphqlSchema = createGraphQLServerSchema(database);

	const yoga = createYoga({ cors, schema: graphqlSchema });

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
