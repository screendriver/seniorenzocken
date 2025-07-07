import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve, type ServerType } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { trpcServer } from "@hono/trpc-server";
import type { Database } from "./database/database.ts";
import { createTrpcRouter } from "./trpc.ts";

type ServerOptions = {
	readonly enableCors: boolean;
	readonly database: Database;
};

export function createServer(options: ServerOptions): ServerType {
	const { enableCors, database } = options;
	const honoServer = new Hono();

	const tRpcRouter = createTrpcRouter({ database });

	if (enableCors) {
		honoServer.use("/trpc/*", cors());
	}

	honoServer.use("/trpc/*", trpcServer({ router: tRpcRouter }));

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
