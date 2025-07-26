import { suite, test, expect, vi, type TestFunction } from "vitest";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Hono } from "hono";
import { createTRPCClient, unstable_localLink } from "@trpc/client";
import { stripIndent } from "common-tags";
import { createFakeClock } from "./clock/fake-clock.js";
import type { ServerOptions } from "./server.js";
import { createServer } from "./server.js";
import { createDatabase } from "./database/database.js";
import { seedInMemoryDatabase } from "./seed-in-memory-database.js";
import { createTrpcRouter } from "./trpc/index.js";
import { createTrpcApplicationRouter, type TRPCApplicationRouter } from "./trpc/application-router.js";
import { createAudioRepository } from "./audio/repository.js";

type TestFunctionOptions = {
	readonly server: Hono;
	readonly trpcApplicationRouter: TRPCApplicationRouter;
};

function withServer(testFunction: (options: TestFunctionOptions) => Promise<void>): TestFunction {
	return async () => {
		const fakeClock = createFakeClock();
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);

		const audioRepository = createAudioRepository({ database });
		const trpcApplicationRouter = createTrpcApplicationRouter({
			trpcRouter: createTrpcRouter(),
			database,
			audioRepository,
			isTurnAround: vi.fn().mockReturnValue(false),
		});
		const serverOptions: ServerOptions = {
			clock: fakeClock,
			database,
			trpcApplicationRouter,
			metricsUsername: "foo",
			metricsPassword: "bar",
		};
		const server = createServer(serverOptions);

		await testFunction({ server, trpcApplicationRouter });
	};
}

suite("server", () => {
	test(
		"/health returns a 200 status code",
		withServer(async ({ server }) => {
			const response = await server.request("/health");

			expect(response.status).toBe(200);
			expect(await response.json()).toStrictEqual({
				status: "OK",
				timestamp: "2025-07-24T09:10:20.153Z",
			});
		}),
	);
	test(
		"/metrics returns a 401 status code when no basic auth is given",
		withServer(async ({ server }) => {
			const response = await server.request("/metrics");

			expect(response.status).toBe(401);
			expect(await response.text()).toBe("Unauthorized");
		}),
	);

	test(
		"/metrics returns a 401 status code when wrong credentials are given",
		withServer(async ({ server }) => {
			const response = await server.request("/metrics", {
				headers: {
					Authorization: "Basic nothing",
				},
			});

			expect(response.status).toBe(401);
			expect(await response.text()).toBe("Unauthorized");
		}),
	);

	test(
		"/metrics returns a 200 status code with metrics when correct credentials are given",
		withServer(async ({ server }) => {
			const response = await server.request("/metrics", {
				headers: {
					Authorization: "Basic Zm9vOmJhcg==",
				},
			});

			expect(response.status).toBe(200);
			expect((await response.text()).trimEnd()).toBe(stripIndent`
				# HELP http_request_duration_seconds Duration of HTTP requests in seconds
				# TYPE http_request_duration_seconds histogram

				# HELP http_requests_total Total number of HTTP requests
				# TYPE http_requests_total counter
			`);
		}),
	);

	test(
		"/api/trpc/ uses the given tRPC server",
		withServer(async ({ trpcApplicationRouter }) => {
			const trpcClient = createTRPCClient<TRPCApplicationRouter>({
				links: [
					unstable_localLink({
						router: trpcApplicationRouter,
						async createContext() {
							return {};
						},
					}),
				],
			});

			await expect(trpcClient.teams.query()).resolves.toEqual([
				{
					createdAt: "2025-07-10 10:17:51",
					player1Id: 1,
					player2Id: 3,
					teamId: 1,
				},
				{
					createdAt: "2025-08-10 15:00:00",
					player1Id: 5,
					player2Id: 8,
					teamId: 2,
				},
			]);
		}),
	);

	test(
		"/api/audio/:file_id returns a HTTP 400 status code when :file_id is not a number",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/foo");

			expect(response.status).toBe(400);
			expect(await response.text()).toBe("Invalid audio file id");
		}),
	);

	test(
		"/api/audio/:file_id returns a HTTP 400 status code when :file_id is not an integer",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/42.2");

			expect(response.status).toBe(400);
			expect(await response.text()).toBe("Invalid audio file id");
		}),
	);

	test(
		"/api/audio/:file_id returns a HTTP 404 status code when :file_id cannot be found in the database",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/42");

			expect(response.status).toBe(404);
			expect(await response.text()).toBe("Audio file could not be found");
		}),
	);

	test(
		"/api/audio/:file_id returns an audio file binary when id can be found",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/1");

			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Disposition")).toBe("inline; filename=turn_around.m4a");
			expect(response.headers.get("Content-Type")).toBe("audio/mp4");
			expect((await response.blob()).size).toBe(884);
		}),
	);
});
