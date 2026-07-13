import { randomUUID } from "node:crypto";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { describe, it, expect, vi, type TestFunction } from "vitest";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Hono } from "hono";
import { createTRPCClient, unstable_localLink } from "@trpc/client";
import { nothing } from "true-myth/maybe";
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
	readonly trpcApplicationRouter: TRPCApplicationRouter;
};

type BrowserApplicationPathTestFunctionOptions = {
	readonly browserApplicationPath: string;
};

type WithBrowserApplicationPathOptions = {
	readonly files?: Readonly<Record<string, string>>;
};

type WithServerOptions = {
	readonly browserApplicationPath: string;
};

function withServer(
	testFunction: (options: TestFunctionOptions) => Promise<void>,
	withServerOptions: WithServerOptions = {
		browserApplicationPath: "./browser-application"
	}
): TestFunction {
	return async () => {
		const fakeClock = createFakeClock();
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);

		const audioRepository = createAudioRepository({ database });
		const playersRepository = createPlayersRepository({ database });
		const sessionRepository = createSessionRepository({ database, randomUUID: vi.fn().mockReturnValue("") });
		const trpcApplicationRouter = createTrpcApplicationRouter({
			trpcRouter: createTrpcRouter(),
			database,
			audioRepository,
			playersRepository,
			sessionRepository,
			isTurnAround: vi.fn().mockReturnValue(false)
		});
		const serverOptions: ServerOptions = {
			clock: fakeClock,
			database,
			trpcApplicationRouter,
			sessionRepository: createSessionRepository({ database, randomUUID }),
			browserApplicationPath: withServerOptions.browserApplicationPath,
			seniorenzockenUsername: "hello",
			seniorenzockenPassword: "world",
			isRunningInProduction: false
		};
		const server = createServer(serverOptions);

		await testFunction({ server, trpcApplicationRouter });
	};
}

function withBrowserApplicationPath(
	testFunction: (options: BrowserApplicationPathTestFunctionOptions) => Promise<void>,
	withBrowserApplicationPathOptions: WithBrowserApplicationPathOptions = {}
): TestFunction {
	return async () => {
		const browserApplicationPath = await mkdtemp("./target/test-browser-application-");

		try {
			for (const [filePath, fileContent] of Object.entries(withBrowserApplicationPathOptions.files ?? {})) {
				const fileLocation = join(browserApplicationPath, filePath);

				await mkdir(dirname(fileLocation), { recursive: true });
				await writeFile(fileLocation, fileContent);
			}

			await testFunction({ browserApplicationPath });
		} finally {
			await rm(browserApplicationPath, { recursive: true, force: true });
		}
	};
}

function withServerAndBrowserApplicationPath(
	testFunction: (options: TestFunctionOptions) => Promise<void>,
	withBrowserApplicationPathOptions: WithBrowserApplicationPathOptions = {}
): TestFunction {
	return async (testContext) => {
		await withBrowserApplicationPath(async (browserApplicationPathTestFunctionOptions) => {
			const { browserApplicationPath } = browserApplicationPathTestFunctionOptions;

			await withServer(testFunction, { browserApplicationPath })(testContext);
		}, withBrowserApplicationPathOptions)(testContext);
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
		"does not compress HTTP responses itself",
		withServer(async ({ server }) => {
			const response = await server.request("/health", {
				headers: new Headers({
					"Accept-Encoding": "gzip, deflate, br, zstd"
				})
			});
			const actualContentEncoding = response.headers.get("Content-Encoding");
			const expectedContentEncoding = null;

			expect(actualContentEncoding).toBe(expectedContentEncoding);
		})
	);

	it(
		"uses the given tRPC server on /api/trpc/ route",
		withServer(async ({ trpcApplicationRouter }) => {
			const trpcClient = createTRPCClient<TRPCApplicationRouter>({
				links: [
					unstable_localLink({
						router: trpcApplicationRouter,
						async createContext() {
							return {
								session: nothing()
							};
						}
					})
				]
			});

			await expect(trpcClient.teams.query()).resolves.toStrictEqual([]);
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

describe("cache headers", () => {
	it(
		"returns immutable cache headers for browser assets",
		withServerAndBrowserApplicationPath(
			async (testFunctionOptions) => {
				const { server } = testFunctionOptions;
				const response = await server.request("/assets/index-BThKbJIQ.js");

				expect(response.status).toBe(200);
				expect(response.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
			},
			{
				files: {
					"index.html": "<!DOCTYPE html><html></html>",
					"assets/index-BThKbJIQ.js": "// test js"
				}
			}
		)
	);

	it(
		"returns immutable cache headers for browser stylesheets",
		withServerAndBrowserApplicationPath(
			async (testFunctionOptions) => {
				const { server } = testFunctionOptions;
				const response = await server.request("/assets/index-BLpnfDeo.css");

				expect(response.status).toBe(200);
				expect(response.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
			},
			{
				files: {
					"index.html": "<!DOCTYPE html><html></html>",
					"assets/index-BLpnfDeo.css": "/* test css */"
				}
			}
		)
	);

	it(
		"returns no-cache headers for index.html",
		withServerAndBrowserApplicationPath(
			async (testFunctionOptions) => {
				const { server } = testFunctionOptions;
				const response = await server.request("/index.html");

				expect(response.status).toBe(200);
				expect(response.headers.get("Cache-Control")).toBe("no-cache");
			},
			{
				files: {
					"index.html": "<!DOCTYPE html><html></html>"
				}
			}
		)
	);

	it(
		"returns no-cache headers for the root path",
		withServerAndBrowserApplicationPath(
			async (testFunctionOptions) => {
				const { server } = testFunctionOptions;
				const response = await server.request("/");

				expect(response.status).toBe(200);
				expect(response.headers.get("Cache-Control")).toBe("no-cache");
			},
			{
				files: {
					"index.html": "<!DOCTYPE html><html></html>"
				}
			}
		)
	);

	it(
		"returns no-cache headers for single page application fallback routes",
		withServerAndBrowserApplicationPath(
			async (testFunctionOptions) => {
				const { server } = testFunctionOptions;
				const response = await server.request("/teams-selection");

				expect(response.status).toBe(200);
				expect(response.headers.get("Cache-Control")).toBe("no-cache");
			},
			{
				files: {
					"index.html": "<!DOCTYPE html><html></html>"
				}
			}
		)
	);
});
