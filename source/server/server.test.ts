import { randomUUID } from "node:crypto";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import assert from "node:assert";
import { suite, test } from "mocha";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Hono } from "hono";
import { createTRPCClient, unstable_localLink } from "@trpc/client";
import { nothing } from "true-myth/maybe";
import { createDeterministicWallClock } from "@enormora/wall-clock/deterministic-wall-clock";
import { type ServerOptions, createServer } from "./server.js";
import { createDatabase } from "./database/database.js";
import { seedInMemoryDatabase } from "./seed-in-memory-database.js";
import { createTrpcRouter } from "./trpc/index.js";
import { createTrpcApplicationRouter, type TRPCApplicationRouter } from "./trpc/application-router.js";
import { createAudioRepository } from "./audio/repository.js";
import { createPlayersRepository } from "./players/players-repository.js";
import { createSessionRepository } from "./session/session-repository.js";
import type { HonoEnvironment } from "./hono-environment.js";

type ServerTestOptions = {
	readonly server: Hono<HonoEnvironment>;
	readonly trpcApplicationRouter: TRPCApplicationRouter;
};

type BrowserApplicationPathTestOptions = {
	readonly browserApplicationPath: string;
};

type WithBrowserApplicationPathOptions = {
	readonly files?: Readonly<Record<string, string>>;
};

type WithServerOptions = {
	readonly browserApplicationPath: string;
};

type AsyncServerTest = () => Promise<void>;

function withServer(
	testFunction: (options: ServerTestOptions) => Promise<void>,
	withServerOptions: WithServerOptions = {
		browserApplicationPath: "./browser-application"
	}
): AsyncServerTest {
	return async () => {
		const clock = createDeterministicWallClock({
			initialCurrentTimestampInMilliseconds: Date.parse("2025-07-24T09:10:20.153Z")
		});
		const database = createDatabase(":memory:");
		await migrate(database, { migrationsFolder: "./drizzle" });
		await seedInMemoryDatabase(database);

		const audioRepository = createAudioRepository({ database });
		const playersRepository = createPlayersRepository({ database });
		const sessionRepository = createSessionRepository({
			database,
			randomUUID: () => {
				return "00000000-0000-0000-0000-000000000000";
			}
		});
		const trpcApplicationRouter = createTrpcApplicationRouter({
			trpcRouter: createTrpcRouter(),
			database,
			audioRepository,
			playersRepository,
			sessionRepository,
			isTurnAround: () => {
				return false;
			}
		});
		const serverOptions: ServerOptions = {
			clock,
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
	testFunction: (options: BrowserApplicationPathTestOptions) => Promise<void>,
	withBrowserApplicationPathOptions: WithBrowserApplicationPathOptions = {}
): AsyncServerTest {
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
	testFunction: (options: ServerTestOptions) => Promise<void>,
	withBrowserApplicationPathOptions: WithBrowserApplicationPathOptions = {}
): AsyncServerTest {
	return async () => {
		await withBrowserApplicationPath(async (browserApplicationPathTestOptions) => {
			const { browserApplicationPath } = browserApplicationPathTestOptions;

			await withServer(testFunction, { browserApplicationPath })();
		}, withBrowserApplicationPathOptions)();
	};
}

suite("server", function () {
	test(
		"returns a 200 status code on /health route",
		withServer(async ({ server }) => {
			const response = await server.request("/health");

			assert.strictEqual(response.status, 200);
			assert.deepStrictEqual(await response.json(), {
				status: "OK",
				timestamp: "2025-07-24T09:10:20.153Z"
			});
		})
	);

	test(
		"does not compress HTTP responses itself",
		withServer(async ({ server }) => {
			const response = await server.request("/health", {
				headers: new Headers({
					"Accept-Encoding": "gzip, deflate, br, zstd"
				})
			});
			const actualContentEncoding = response.headers.get("Content-Encoding");
			const expectedContentEncoding = null;

			assert.strictEqual(actualContentEncoding, expectedContentEncoding);
		})
	);

	test(
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

			assert.deepStrictEqual(await trpcClient.teams.query(), []);
		})
	);

	test(
		"returns a HTTP 400 status code when :file_id is not a number on /api/audio/:file_id route",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/foo");

			assert.strictEqual(response.status, 400);
			assert.strictEqual(await response.text(), "Invalid audio file id");
		})
	);

	test(
		"returns a HTTP 400 status code when :file_id is not an integer on /api/audio/:file_id route",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/42.2");

			assert.strictEqual(response.status, 400);
			assert.strictEqual(await response.text(), "Invalid audio file id");
		})
	);

	test(
		"returns a HTTP 404 status code when :file_id cannot be found in the database on /api/audio/:file_id route",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/42");

			assert.strictEqual(response.status, 404);
			assert.strictEqual(await response.text(), "Audio file could not be found");
		})
	);

	test(
		"returns an audio file binary when id can be found on /api/audio/:file_id route",
		withServer(async ({ server }) => {
			const response = await server.request("/api/audio/1");

			assert.strictEqual(response.status, 200);
			assert.strictEqual(response.headers.get("Content-Disposition"), "inline; filename=turn_around.m4a");
			assert.strictEqual(response.headers.get("Content-Type"), "audio/mp4");

			const responseBlob = await response.blob();

			assert.strictEqual(responseBlob.size, 884);
		})
	);
});

suite("cache headers", function () {
	test(
		"returns immutable cache headers for browser assets",
		withServerAndBrowserApplicationPath(
			async (testFunctionOptions) => {
				const { server } = testFunctionOptions;
				const response = await server.request("/assets/index-BThKbJIQ.js");

				assert.strictEqual(response.status, 200);
				assert.strictEqual(response.headers.get("Cache-Control"), "public, max-age=31536000, immutable");
			},
			{
				files: {
					"index.html": "<!DOCTYPE html><html></html>",
					"assets/index-BThKbJIQ.js": "// test js"
				}
			}
		)
	);

	test(
		"returns immutable cache headers for browser stylesheets",
		withServerAndBrowserApplicationPath(
			async (testFunctionOptions) => {
				const { server } = testFunctionOptions;
				const response = await server.request("/assets/index-BLpnfDeo.css");

				assert.strictEqual(response.status, 200);
				assert.strictEqual(response.headers.get("Cache-Control"), "public, max-age=31536000, immutable");
			},
			{
				files: {
					"index.html": "<!DOCTYPE html><html></html>",
					"assets/index-BLpnfDeo.css": "/* test css */"
				}
			}
		)
	);

	test(
		"returns no-cache headers for index.html",
		withServerAndBrowserApplicationPath(
			async (testFunctionOptions) => {
				const { server } = testFunctionOptions;
				const response = await server.request("/index.html");

				assert.strictEqual(response.status, 200);
				assert.strictEqual(response.headers.get("Cache-Control"), "no-cache");
			},
			{
				files: {
					"index.html": "<!DOCTYPE html><html></html>"
				}
			}
		)
	);

	test(
		"returns no-cache headers for the root path",
		withServerAndBrowserApplicationPath(
			async (testFunctionOptions) => {
				const { server } = testFunctionOptions;
				const response = await server.request("/");

				assert.strictEqual(response.status, 200);
				assert.strictEqual(response.headers.get("Cache-Control"), "no-cache");
			},
			{
				files: {
					"index.html": "<!DOCTYPE html><html></html>"
				}
			}
		)
	);

	test(
		"returns no-cache headers for single page application fallback routes",
		withServerAndBrowserApplicationPath(
			async (testFunctionOptions) => {
				const { server } = testFunctionOptions;
				const response = await server.request("/teams-selection");

				assert.strictEqual(response.status, 200);
				assert.strictEqual(response.headers.get("Cache-Control"), "no-cache");
			},
			{
				files: {
					"index.html": "<!DOCTYPE html><html></html>"
				}
			}
		)
	);
});
