import { describe, it, expect, vi, type Mock } from "vitest";
import { Factory } from "fishery";
import Task from "true-myth/task";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import type { SessionRepository } from "../session/session-repository.js";
import { createAuthenticateHandlers, type AuthenticateHandlersOptions } from "./authentication.js";

const authenticateHandlersOptionsFactory = Factory.define<AuthenticateHandlersOptions>(() => {
	return {
		sessionRepository: {
			createSession: vi.fn().mockReturnValue(Task.resolve({ token: "test-token" }))
		} as unknown as SessionRepository,
		seniorenzockenUsername: "test-username",
		seniorenzockenPassword: "test-password",
		isRunningInProduction: false
	};
});

type SessionRepositoryOverrides = {
	readonly createSession?: Mock;
	readonly isRunningInProduction?: boolean;
};

//
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

describe("authentication handler", () => {
	it("returns exactly one handler", async () => {
		const options = authenticateHandlersOptionsFactory.build();
		const handlers = createAuthenticateHandlers(options);

		expect(handlers).toHaveLength(1);
	});

	it("returns an HTTP 400 status code when there is no JSON payload", async () => {
		const { testClient } = createTestClient();

		const response = await testClient.index.$post();

		expect(response.status).toBe(400);
	});

	it("returns an HTTP 400 status code when the JSON payload is invalid", async () => {
		const { testClient } = createTestClient();

		const response = await testClient.index.$post(undefined, {
			headers: { "Content-Type": "application/json" },
			init: {
				body: JSON.stringify({ foo: "bar" })
			}
		});

		expect(response.status).toBe(400);
	});

	it("returns an HTTP 401 status code when username is invalid", async () => {
		const { testClient } = createTestClient();

		const response = await testClient.index.$post(undefined, {
			headers: { "Content-Type": "application/json" },
			init: {
				body: JSON.stringify({ username: "invalid", password: "test-password" })
			}
		});

		expect(response.status).toBe(401);
		await expect(response.text()).resolves.toBe("Invalid credentials");
	});

	it("returns an HTTP 401 status code when password is invalid", async () => {
		const { testClient } = createTestClient();

		const response = await testClient.index.$post(undefined, {
			headers: { "Content-Type": "application/json" },
			init: {
				body: JSON.stringify({ username: "test-username", password: "invalid" })
			}
		});

		expect(response.status).toBe(401);
		await expect(response.text()).resolves.toBe("Invalid credentials");
	});

	it("returns an HTTP 500 status code when a new session could not be created", async () => {
		const createSession = vi.fn().mockReturnValue(Task.reject(new Error("Test error")));
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

		expect(response.status).toBe(500);
	});

	it("returns an HTTP 200 status code when username and password is correct", async () => {
		const createSession = vi.fn().mockReturnValue(Task.resolve({ token: "test-token" }));
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

		expect(createSession).toHaveBeenCalledExactlyOnceWith({ ipAddress: undefined, userAgent: undefined });
		expect(response.status).toBe(200);
		expect(response.headers.getSetCookie()).toStrictEqual([
			"seniorenzocken.session_token=test-token; Path=/; HttpOnly; SameSite=Lax"
		]);
		await expect(response.json()).resolves.toStrictEqual({ success: true });
	});

	it("sets a secure cookie when running in production", async () => {
		const createSession = vi.fn().mockReturnValue(Task.resolve({ token: "test-token" }));
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

		expect(createSession).toHaveBeenCalledExactlyOnceWith({ ipAddress: undefined, userAgent: undefined });
		expect(response.status).toBe(200);
		expect(response.headers.getSetCookie()).toStrictEqual([
			"seniorenzocken.session_token=test-token; Path=/; HttpOnly; Secure; SameSite=Lax"
		]);
		await expect(response.json()).resolves.toStrictEqual({ success: true });
	});

	it("sets IP address and user agent in session", async () => {
		const createSession = vi.fn().mockReturnValue(Task.resolve({ token: "test-token" }));
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

		expect(createSession).toHaveBeenCalledExactlyOnceWith({ ipAddress: "127.0.0.1", userAgent: "test-user-agent" });
	});
});
