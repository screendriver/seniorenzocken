import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { compress } from "hono/compress";
import { validator } from "hono/validator";
import { serveStatic } from "@hono/node-server/serve-static";
import { trpcServer } from "@hono/trpc-server";
import { basicAuth } from "hono/basic-auth";
import { prometheus } from "@hono/prometheus";
import { eq } from "drizzle-orm";
import { safeParse, object, pipe, string, transform, number, integer } from "valibot";
import mime from "mime";
import * as Sentry from "@sentry/node";
import type { Clock } from "./clock/clock.js";
import type { Database } from "./database/database.js";
import { gamePointAudios } from "./database/schema.js";
import type { TRPCApplicationRouter } from "./trpc/application-router.js";

export type ServerOptions = {
	readonly clock: Clock;
	readonly database: Database;
	readonly trpcApplicationRouter: TRPCApplicationRouter;
	readonly metricsUsername: string;
	readonly metricsPassword: string;
};

export function createServer(options: ServerOptions): Hono {
	const { clock, database, trpcApplicationRouter, metricsUsername, metricsPassword } = options;

	const { printMetrics, registerMetrics } = prometheus();

	return new Hono()
		.onError((error, context) => {
			Sentry.captureException(error);

			if (error instanceof HTTPException) {
				return error.getResponse();
			}
			return context.json({ error: "Internal server error" }, 500);
		})

		.use(compress())

		.get("/health", (context) => {
			return context.json({ status: "OK", timestamp: clock.now });
		})

		.use("*", registerMetrics)
		.use(
			"/metrics",
			basicAuth({
				username: metricsUsername,
				password: metricsPassword,
				realm: "metrics"
			})
		)
		.get("/metrics", printMetrics)

		.use("/api/trpc/*", trpcServer({ router: trpcApplicationRouter, endpoint: "/api/trpc" }))

		.get(
			"/api/audio/:file_id",
			validator("param", (value, context) => {
				const audioFileIdSchema = object({
					file_id: pipe(
						string(),
						transform((id) => {
							return Number.parseFloat(id);
						}),
						number(),
						integer()
					)
				});

				const parametersParseResult = safeParse(audioFileIdSchema, value);

				if (!parametersParseResult.success) {
					return context.text("Invalid audio file id", 400);
				}

				return parametersParseResult.output;
			}),
			async (context) => {
				const audioFileId = context.req.valid("param").file_id;
				const databaseEntries = await database
					.select({ name: gamePointAudios.name, audioFile: gamePointAudios.audioFile })
					.from(gamePointAudios)
					.where(eq(gamePointAudios.gamePointAudioId, audioFileId))
					.limit(1);
				const databaseEntry = databaseEntries[0];

				if (databaseEntry === undefined) {
					return context.text("Audio file could not be found", 404);
				}

				return context.body(databaseEntry.audioFile, 200, {
					"Content-Disposition": `inline; filename=${databaseEntry.name}`,
					"Content-Type": mime.getType(databaseEntry.name) ?? "application/octet-stream",
					"Cache-Control": "public, max-age=86400"
				});
			}
		)

		.use("/*", serveStatic({ root: "./browser-application" }))

		.get("*", serveStatic({ path: "./browser-application/index.html" }));
}
