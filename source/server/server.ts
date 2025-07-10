import { Hono } from "hono";
import { validator } from "hono/validator";
import { serveStatic } from "@hono/node-server/serve-static";
import { trpcServer } from "@hono/trpc-server";
import { eq } from "drizzle-orm";
import { safeParse, object, pipe, string, transform, number, integer } from "valibot";
import mime from "mime";
import type { Database } from "./database/database.ts";
import { gamePointAudios } from "./database/schema.ts";
import { corsMiddleware } from "./cors-middleware.ts";
import type { TRPCRouter } from "../shared/trpc.ts";

export type ServerOptions = {
	readonly enableCors: boolean;
	readonly database: Database;
	readonly trpcRouter: TRPCRouter;
};

export function createServer(options: ServerOptions): Hono {
	const { enableCors, database, trpcRouter } = options;

	return new Hono()
		.use("/api/trpc/*", corsMiddleware({ enableCors }))

		.use("/api/trpc/*", trpcServer({ router: trpcRouter, endpoint: "/api/trpc" }))

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
						integer(),
					),
				});

				const parametersParseResult = safeParse(audioFileIdSchema, value);

				if (!parametersParseResult.success) {
					return context.text("Invalid audio file id", 404);
				}

				return parametersParseResult.output;
			}),
			async (context) => {
				const audioFileId = context.req.valid("param").file_id;
				const databaseEntry = await database
					.select({ name: gamePointAudios.name, audioFile: gamePointAudios.audioFile })
					.from(gamePointAudios)
					.where(eq(gamePointAudios.gamePointAudioId, audioFileId))
					.limit(1);

				if (databaseEntry.length === 0) {
					return context.text("Audio file could not be found", 404);
				}

				const audioFileDatabaseEntry = databaseEntry[0];

				return context.body(audioFileDatabaseEntry.audioFile, 200, {
					"Content-Disposition": `inline; filename=${audioFileDatabaseEntry.name}`,
					"Content-Type": mime.getType(audioFileDatabaseEntry.name) ?? "application/octet-stream",
				});
			},
		)

		.use("/*", serveStatic({ root: "./browser-application" }))

		.get("*", serveStatic({ path: "./browser-application/index.html" }));
}
