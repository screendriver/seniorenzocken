import assert from "node:assert";
import { suite, test } from "mocha";
import { assert as sinonAssert, fake } from "sinon";
import { Factory } from "fishery";
import { resolve, reject } from "true-myth/task";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import type { SessionRepository } from "../session/session-repository.js";
import { createAuthenticateHandlers, type AuthenticateHandlersOptions } from "./authentication.js";

const authenticateHandlersOptionsFactory = Factory.define<AuthenticateHandlersOptions>(() => {
	return {
		sessionRepository: {
			createSession: fake.returns(resolve({ token: "test-token" }))
		} as unknown as SessionRepository,
		seniorenzockenUsername: "test-username",
		seniorenzockenPassword: "test-password",
		isRunningInProduction: false
	};
});

type SessionRepositoryOverrides = {
	readonly createSession?: SessionRepository["createSession"];
	readonly isRunningInProduction?: boolean;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Hono test client infers all routes
function createTestClient(overrides: SessionRepositoryOverrides = {}) {
	const options = authenticateHandlersOptionsFactory.build({
		sessionRepository: { createSession: overrides.createSession },
		isRunningInProduction: overrides.isRunningInProduction ?? false
	});
	const handlers = createAuthenticateHandlers(options);

	const server = new Hono().post("/", ...handlers);

	return { testClient: testClient(server), honoServer: server };
}

suite("authentication handler", function () {
	test("returns exactly one handler", async function () {
		const options = authenticateHandlersOptionsFactory.build();
		const handlers = createAuthenticateHandlers(options);

		assert.strictEqual(handlers.length, 1);
	});

	test("returns an HTTP 400 status code when there is no JSON payload", async function () {
		const { testClient } = createTestClient();

		const response = await testClient.index.$post();

		assert.strictEqual(response.status, 400);
	});

	test("returns an HTTP 400 status code when the JSON payload is invalid", async function () {
		const { testClient } = createTestClient();

		const response = await testClient.index.$post(undefined, {
			headers: { "Content-Type": "application/json" },
			init: {
				body: JSON.stringify({ foo: "bar" })
			}
		});

		assert.strictEqual(response.status, 400);
	});

	test("returns an HTTP 401 status code when username is invalid", async function () {
		const { testClient } = createTestClient();

		const response = await testClient.index.$post(undefined, {
			headers: { "Content-Type": "application/json" },
			init: {
				body: JSON.stringify({ username: "invalid", password: "test-password" })
			}
		});

		assert.strictEqual(response.status, 401);
		assert.strictEqual(await response.text(), "Invalid credentials");
	});

	test("returns an HTTP 401 status code when password is invalid", async function () {
		const { testClient } = createTestClient();

		const response = await testClient.index.$post(undefined, {
			headers: { "Content-Type": "application/json" },
			init: {
				body: JSON.stringify({ username: "test-username", password: "invalid" })
			}
		});

		assert.strictEqual(response.status, 401);
		assert.strictEqual(await response.text(), "Invalid credentials");
	});

	test("returns an HTTP 500 status code when a new session could not be created", async function () {
		const createSession = fake.returns(reject(new Error("Test error")));
		const { honoServer } = createTestClient({ createSession });

		const response = await honoServer.request(
			"/",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: "test-username", password: "test-password" })
			},
			{ server: undefined, incoming: { socket: {} } }
		);

		assert.strictEqual(response.status, 500);
	});

	test("returns an HTTP 200 status code when username and password is correct", async function () {
		const createSession = fake.returns(resolve({ token: "test-token" }));
		const { honoServer } = createTestClient({ createSession });

		const response = await honoServer.request(
			"/",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: "test-username", password: "test-password" })
			},
			{ server: undefined, incoming: { socket: {} } }
		);

		sinonAssert.calledOnceWithExactly(createSession, { ipAddress: undefined, userAgent: undefined });
		assert.strictEqual(response.status, 200);
		assert.deepStrictEqual(response.headers.getSetCookie(), [
			"seniorenzocken.session_token=test-token; Path=/; HttpOnly; SameSite=Lax"
		]);
		assert.deepStrictEqual(await response.json(), { success: true });
	});

	test("sets a secure cookie when running in production", async function () {
		const createSession = fake.returns(resolve({ token: "test-token" }));
		const { honoServer } = createTestClient({ createSession, isRunningInProduction: true });

		const response = await honoServer.request(
			"/",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: "test-username", password: "test-password" })
			},
			{ server: undefined, incoming: { socket: {} } }
		);

		sinonAssert.calledOnceWithExactly(createSession, { ipAddress: undefined, userAgent: undefined });
		assert.strictEqual(response.status, 200);
		assert.deepStrictEqual(response.headers.getSetCookie(), [
			"seniorenzocken.session_token=test-token; Path=/; HttpOnly; Secure; SameSite=Lax"
		]);
		assert.deepStrictEqual(await response.json(), { success: true });
	});

	test("sets IP address and user agent in session", async function () {
		const createSession = fake.returns(resolve({ token: "test-token" }));
		const { honoServer } = createTestClient({ createSession, isRunningInProduction: true });

		await honoServer.request(
			"/",
			{
				method: "POST",
				headers: { "Content-Type": "application/json", "User-Agent": "test-user-agent" },
				body: JSON.stringify({ username: "test-username", password: "test-password" })
			},
			{ server: undefined, incoming: { socket: { remoteAddress: "127.0.0.1" } } }
		);

		sinonAssert.calledOnceWithExactly(createSession, { ipAddress: "127.0.0.1", userAgent: "test-user-agent" });
	});
});
