// @vitest-environment happy-dom
import { randomUUID } from "node:crypto";
import { describe, it, expect, vi, type TestFunction } from "vitest";
import { serve } from "@hono/node-server";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Hono } from "hono";
import { createTRPCClient, httpLink } from "@trpc/client";
import { stripIndent } from "common-tags";
import { createFakeClock } from "./clock/fake-clock.js";
import { type ServerOptions, createServer } from "./server.js";
import { createDatabase } from "./database/database.js";
import { seedInMemoryDatabase } from "./seed-in-memory-database.js";
import { createTrpcRouter } from "./trpc/index.js";
import { createTrpcApplicationRouter, type TRPCApplicationRouter } from "./trpc/application-router.js";
import { createAudioRepository } from "./audio/repository.js";
import { createPlayersRepository } from "./players/players-repository.js";
import { createSessionRepository } from "./session/session-repository.js";
import type { HonoEnvironment } from "./hono-environment.js";

type TestFunctionOptions = {
	readonly server: Hono<HonoEnvironment>;
};

function withServer(testFunction: (options: TestFunctionOptions) => Promise<void>): TestFunction {
	return async () => {
		const fakeClock = createFakeClock();
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);

		const audioRepository = createAudioRepository({ database });
		const playersRepository = createPlayersRepository({ database });
		const trpcApplicationRouter = createTrpcApplicationRouter({
			trpcRouter: createTrpcRouter(),
			database,
			audioRepository,
			playersRepository,
			isTurnAround: vi.fn().mockReturnValue(false)
		});
		const serverOptions: ServerOptions = {
			clock: fakeClock,
			database,
			trpcApplicationRouter,
			sessionRepository: createSessionRepository({ database, randomUUID }),
			metricsUsername: "foo",
			metricsPassword: "bar",
			seniorenzockenUsername: "hello",
			seniorenzockenPassword: "world",
			isRunningInProduction: false
		};
		const server = createServer(serverOptions);

		await testFunction({ server });
	};
}

describe("server", () => {
	it(
		"returns a 200 status code on /health route",
		withServer(async ({ server }) => {
			const response = await server.request("/health");

			expect(response.status).toBe(200);
			await expect(response.json()).resolves.toStrictEqual({
				status: "OK",
				timestamp: "2025-07-24T09:10:20.153Z"
			});
		})
	);

	it(
		"returns a 401 status code when no basic auth is given on /metrics route",
		withServer(async ({ server }) => {
			const response = await server.request("/metrics");

			expect(response.status).toBe(401);
			await expect(response.text()).resolves.toBe("Unauthorized");
		})
	);

	it(
		"returns a 401 status code when wrong credentials are given on /metrics route",
		withServer(async ({ server }) => {
			const response = await server.request("/metrics", {
				headers: {
					Authorization: "Basic nothing"
				}
			});

			expect(response.status).toBe(401);
			await expect(response.text()).resolves.toBe("Unauthorized");
		})
	);

	it(
		"returns a 200 status code with metrics when correct credentials are given on /metrics route",
		withServer(async ({ server }) => {
			const response = await server.request("/metrics", {
				headers: {
					Authorization: "Basic Zm9vOmJhcg=="
				}
			});

			expect(response.status).toBe(200);

			const responseText = await response.text();

			expect(responseText.trimEnd()).toBe(stripIndent`
				# HELP http_request_duration_seconds Duration of HTTP requests in seconds
				# TYPE http_request_duration_seconds histogram

				# HELP http_requests_total Total number of HTTP requests
				# TYPE http_requests_total counter
			`);
		})
	);

	it(
		"uses the given tRPC server on /api/trpc/ route",
		withServer(async ({ server }) => {
			const listeningServer = serve({ fetch: server.fetch });

			const trpcClient = createTRPCClient<TRPCApplicationRouter>({
				links: [httpLink({ url: "/api/trpc" })]
			});

			await expect(trpcClient.teams.query()).resolves.toStrictEqual([
				{
					createdAt: "2025-07-10 10:17:51",
					player1Id: 1,
					player2Id: 3,
					teamId: 1
				},
				{
					createdAt: "2025-08-10 15:00:00",
					player1Id: 5,
					player2Id: 8,
					teamId: 2
				}
			]);

			listeningServer.close();
		})
	);

	it(
		"returns a HTTP 400 status code when :file_id is not a number on /api/audio/:file_id route",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/foo");

			expect(response.status).toBe(400);
			await expect(response.text()).resolves.toBe("Invalid audio file id");
		})
	);

	it(
		"returns a HTTP 400 status code when :file_id is not an integer on /api/audio/:file_id route",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/42.2");

			expect(response.status).toBe(400);
			await expect(response.text()).resolves.toBe("Invalid audio file id");
		})
	);

	it(
		"returns a HTTP 404 status code when :file_id cannot be found in the database on /api/audio/:file_id route",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/42");

			expect(response.status).toBe(404);
			await expect(response.text()).resolves.toBe("Audio file could not be found");
		})
	);

	it(
		"returns an audio file binary when id can be found on /api/audio/:file_id route",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/1");

			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Disposition")).toBe("inline; filename=turn_around.m4a");
			expect(response.headers.get("Content-Type")).toBe("audio/mp4");

			const responseBlob = await response.blob();

			expect(responseBlob.size).toBe(884);
		})
	);
});
