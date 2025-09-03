import { describe, it, expect, vi, type Mock } from "vitest";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import { Task } from "true-myth/task";
import { sessionMiddleware } from "./session-middleware.js";
import type { SessionRepository } from "./session-repository.js";

type SessionRepositoryOverrides = {
	readonly getSession?: Mock;
};

function createSessionRepository(overrides: SessionRepositoryOverrides = {}): SessionRepository {
	return {
		getSession: overrides.getSession ?? vi.fn()
	} as unknown as SessionRepository;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Hono test client infers all routes
function createTestClient(overrides: SessionRepositoryOverrides = {}) {
	const server = new Hono()
		.use(sessionMiddleware({ sessionRepository: createSessionRepository(overrides) }))
		.get("/", async (context) => {
			return context.get("session").match({
				Just(session) {
					return context.text(session.token);
				},
				Nothing() {
					return context.text("OK");
				}
			});
		});

	return testClient(server);
}

describe("session middleware", () => {
	it("calls next middleware when there is no Cookie present", async () => {
		const client = createTestClient();
		const response = await client.index.$get();

		expect(response.status).toBe(200);

		await expect(response.text()).resolves.toBe("OK");
	});

	it("calls next middleware when there is a Cookie present but an invalid one", async () => {
		const getSession = vi.fn().mockResolvedValue(Task.reject(new Error("Test error")));
		const client = createTestClient({ getSession });
		const response = await client.index.$get(undefined, {
			headers: {
				Cookie: "session_token=foobar"
			}
		});

		expect(getSession).toHaveBeenCalledExactlyOnceWith("foobar");

		expect(response.status).toBe(200);
		expect(response.headers.getSetCookie()).toStrictEqual(["session_token=; Max-Age=0; Path=/"]);

		await expect(response.text()).resolves.toBe("OK");
	});

	it("calls next middleware when there is a valid Cookie present", async () => {
		const getSession = vi.fn().mockResolvedValue(Task.resolve({ token: "test-token" }));
		const client = createTestClient({ getSession });
		const response = await client.index.$get(undefined, {
			headers: {
				Cookie: "session_token=foobar"
			}
		});

		expect(getSession).toHaveBeenCalledExactlyOnceWith("foobar");

		expect(response.status).toBe(200);

		await expect(response.text()).resolves.toBe("test-token");
	});
});
