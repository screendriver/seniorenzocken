import { test, expect, type TestFunction } from "vitest";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Hono } from "hono";
import { createTRPCClient, unstable_localLink } from "@trpc/client";
import { createServer, ServerOptions } from "./server.ts";
import { createDatabase } from "./database/database.ts";
import { seedInMemoryDatabase } from "./seed-in-memory-database.ts";
import { createTrpcRouter } from "./trpc-router.ts";
import type { TRPCRouter } from "../shared/trpc.ts";

type TestFunctionOptions = {
	readonly server: Hono;
	readonly trpcRouter: TRPCRouter;
};

function withServer(testFunction: (options: TestFunctionOptions) => Promise<void>): TestFunction {
	return async () => {
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);

		const trpcRouter = createTrpcRouter({ database });
		const serverOptions: ServerOptions = {
			enableCors: false,
			database,
			trpcRouter,
		};
		const server = createServer(serverOptions);

		await testFunction({ server, trpcRouter });
	};
}

test(
	"/api/trpc/ uses the given tRPC server",
	withServer(async ({ trpcRouter }) => {
		const trpcClient = createTRPCClient<TRPCRouter>({
			links: [
				unstable_localLink({
					router: trpcRouter,
					async createContext() {
						return {};
					},
				}),
			],
		});

		await expect(trpcClient.teams.query()).resolves.toEqual([
			{
				player1Id: 1,
				player2Id: 3,
				teamId: 1,
			},
			{
				player1Id: 5,
				player2Id: 8,
				teamId: 2,
			},
		]);
	}),
);

test(
	"/api/audio/:file_id returns a HTTP 404 status code when :file_id is not a number",
	withServer(async ({ server }) => {
		const response = await server.request("/api/audio/foo");

		expect(response.status).toBe(404);
		expect(await response.text()).toBe("Invalid audio file id");
	}),
);

test(
	"/api/audio/:file_id returns a HTTP 404 status code when :file_id is not an integer",
	withServer(async ({ server }) => {
		const response = await server.request("/api/audio/42.2");

		expect(response.status).toBe(404);
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
		expect(response.headers.get("Content-Disposition")).toBe("inline; filename=attention.m4a");
		expect(response.headers.get("Content-Type")).toBe("audio/mp4");
		expect((await response.blob()).size).toBe(2691);
	}),
);
