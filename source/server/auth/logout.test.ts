import { describe, it, expect, vi, type Mock } from "vitest";
import { Factory } from "fishery";
import { Task } from "true-myth/task";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import { Unit } from "true-myth/unit";
import type { SessionRepository } from "../session/session-repository.js";
import { createLogoutHandlers, type LogoutHandlersOptions } from "./logout.js";

const logoutHandlersOptionsFactory = Factory.define<LogoutHandlersOptions>(() => {
	return {
		sessionRepository: {
			deleteSession: vi.fn().mockReturnValue(Task.resolve(Unit))
		} as unknown as SessionRepository
	};
});

type SessionRepositoryOverrides = {
	readonly deleteSession?: Mock;
};

//
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Hono test client infers all routes
function createTestClient(overrides: SessionRepositoryOverrides = {}) {
	const options = logoutHandlersOptionsFactory.build({
		sessionRepository: { deleteSession: overrides.deleteSession ?? vi.fn().mockReturnValue(Task.resolve(Unit)) }
	});
	const handlers = createLogoutHandlers(options);

	const server = new Hono().post("/", ...handlers);

	return { testClient: testClient(server), honoServer: server };
}

describe("logout handler", () => {
	it("returns exactly one handler", async () => {
		const options = logoutHandlersOptionsFactory.build();
		const handlers = createLogoutHandlers(options);

		expect(handlers).toHaveLength(1);
	});

	it("returns an HTTP 400 status code when there is no cookie set", async () => {
		const { testClient } = createTestClient();

		const response = await testClient.index.$post();

		expect(response.status).toBe(400);
	});

	it("returns an HTTP 204 status code and deletes the cookie", async () => {
		const deleteSession = vi.fn().mockReturnValue(Task.resolve(Unit));
		const { testClient } = createTestClient({ deleteSession });

		const response = await testClient.index.$post(undefined, {
			init: {
				headers: {
					Cookie: "seniorenzocken.session_token=foo-bar"
				}
			}
		});

		expect(deleteSession).toHaveBeenCalledExactlyOnceWith("foo-bar");

		expect(response.status).toBe(204);

		expect(response.headers.getSetCookie()).toStrictEqual(["seniorenzocken.session_token=; Max-Age=0; Path=/"]);
	});

	it("still returns an HTTP 204 status code and deletes the cookie even when deleting the session war rejected", async () => {
		const deleteSession = vi.fn().mockReturnValue(Task.reject(new Error("test")));
		const { testClient } = createTestClient({ deleteSession });

		const response = await testClient.index.$post(undefined, {
			init: {
				headers: {
					Cookie: "seniorenzocken.session_token=foo-bar"
				}
			}
		});

		expect(deleteSession).toHaveBeenCalledExactlyOnceWith("foo-bar");

		expect(response.status).toBe(204);

		expect(response.headers.getSetCookie()).toStrictEqual(["seniorenzocken.session_token=; Max-Age=0; Path=/"]);
	});
});
