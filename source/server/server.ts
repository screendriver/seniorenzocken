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
import type { SessionRepository } from "./session/session-repository.js";
import { sessionMiddleware } from "./session/session-middleware.js";
import type { HonoEnvironment } from "./hono-environment.js";
import { createAuthenticateHandlers } from "./auth/authentication.js";

export type ServerOptions = {
	readonly clock: Clock;
	readonly database: Database;
	readonly trpcApplicationRouter: TRPCApplicationRouter;
	readonly sessionRepository: SessionRepository;
	readonly metricsUsername: string;
	readonly metricsPassword: string;
	readonly seniorenzockenUsername: string;
	readonly seniorenzockenPassword: string;
	readonly isRunningInProduction: boolean;
};

export function createServer(options: ServerOptions): Hono<HonoEnvironment> {
	const {
		clock,
		database,
		trpcApplicationRouter,
		sessionRepository,
		metricsUsername,
		metricsPassword,
		seniorenzockenUsername,
		seniorenzockenPassword,
		isRunningInProduction
	} = options;

	const { printMetrics, registerMetrics } = prometheus();

	return new Hono<HonoEnvironment>()
		.onError((error, context) => {
			if (error instanceof HTTPException) {
				if (error.status === 401 && error.message === "Unauthorized") {
					return error.getResponse();
				}

				Sentry.captureException(error);
				return error.getResponse();
			}

			Sentry.captureException(error);
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

		.use(sessionMiddleware({ sessionRepository }))

		.post(
			"/api/authenticate",
			...createAuthenticateHandlers({
				sessionRepository,
				seniorenzockenUsername,
				seniorenzockenPassword,
				isRunningInProduction
			})
		)

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

				const audioFile = new Uint8Array(databaseEntry.audioFile);

				return context.body(audioFile, 200, {
					"Content-Disposition": `inline; filename=${databaseEntry.name}`,
					"Content-Type": mime.getType(databaseEntry.name) ?? "application/octet-stream",
					"Cache-Control": "public, max-age=86400"
				});
			}
		)

		.use("/*", serveStatic({ root: "./browser-application" }))

		.get("*", serveStatic({ path: "./browser-application/index.html" }));
}
