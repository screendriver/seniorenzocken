import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { serveStatic } from "@hono/node-server/serve-static";
import { trpcServer } from "@hono/trpc-server";
import { eq } from "drizzle-orm";
import { safeParse, object, pipe, string, transform, number, integer } from "valibot";
import mime from "mime";
import * as Sentry from "@sentry/node";
import type { Clock } from "./clock/clock.js";
import type { Database } from "./database/database.js";
import { gamePointAudios } from "./database/raw-database-schema.js";
import type { TRPCApplicationRouter } from "./trpc/application-router.js";
import type { SessionRepository } from "./session/session-repository.js";
import { sessionMiddleware } from "./session/session-middleware.js";
import type { HonoEnvironment } from "./hono-environment.js";
import { createAuthenticateHandlers } from "./auth/authentication.js";
import { createTRPCContext } from "./trpc/context.js";
import { createLogoutHandlers } from "./auth/logout.js";

export type ServerOptions = {
	readonly clock: Clock;
	readonly database: Database;
	readonly trpcApplicationRouter: TRPCApplicationRouter;
	readonly sessionRepository: SessionRepository;
	readonly browserApplicationPath: string;
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
		browserApplicationPath,
		seniorenzockenUsername,
		seniorenzockenPassword,
		isRunningInProduction
	} = options;

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

		.get("/health", (context) => {
			return context.json({ status: "OK", timestamp: clock.now });
		})

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

		.post("/api/logout", ...createLogoutHandlers({ sessionRepository }))

		.use(
			"/api/trpc/*",
			trpcServer({
				router: trpcApplicationRouter,
				endpoint: "/api/trpc",
				createContext(_contextOptions, honoContext) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- @hono/trpc-server gives us Context<any> here
					return createTRPCContext({ honoContext: honoContext as unknown as Context<HonoEnvironment> });
				}
			})
		)

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

		.use(
			"/*",
			serveStatic({
				root: browserApplicationPath,
				async onFound(path, context) {
					if (path.includes("/assets/")) {
						context.res.headers.set("Cache-Control", "public, max-age=31536000, immutable");
						return;
					}

					context.res.headers.set("Cache-Control", "no-cache");
				}
			})
		)

		.get(
			"*",
			serveStatic({
				path: `${browserApplicationPath}/index.html`,
				async onFound(_path, context) {
					context.res.headers.set("Cache-Control", "no-cache");
				}
			})
		);
}
