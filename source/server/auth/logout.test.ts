import assert from "node:assert";
import { suite, test } from "mocha";
import { assert as sinonAssert, fake } from "sinon";
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
			deleteSession: fake.returns(Task.resolve(Unit))
		} as unknown as SessionRepository
	};
});

type SessionRepositoryOverrides = {
	readonly deleteSession?: SessionRepository["deleteSession"];
};

//
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Hono test client infers all routes
function createTestClient(overrides: SessionRepositoryOverrides = {}) {
	const options = logoutHandlersOptionsFactory.build({
		sessionRepository: { deleteSession: overrides.deleteSession ?? fake.returns(Task.resolve(Unit)) }
	});
	const handlers = createLogoutHandlers(options);

	const server = new Hono().post("/", ...handlers);

	return { testClient: testClient(server), honoServer: server };
}

suite("logout handler", function () {
	test("returns exactly one handler", async function () {
		const options = logoutHandlersOptionsFactory.build();
		const handlers = createLogoutHandlers(options);

		assert.strictEqual(handlers.length, 1);
	});

	test("returns an HTTP 400 status code when there is no cookie set", async function () {
		const { testClient } = createTestClient();

		const response = await testClient.index.$post();

		assert.strictEqual(response.status, 400);
	});

	test("returns an HTTP 204 status code and deletes the cookie", async function () {
		const deleteSession = fake.returns(Task.resolve(Unit));
		const { testClient } = createTestClient({ deleteSession });

		const response = await testClient.index.$post(undefined, {
			init: {
				headers: {
					Cookie: "seniorenzocken.session_token=foo-bar"
				}
			}
		});

		sinonAssert.calledOnceWithExactly(deleteSession, "foo-bar");

		assert.strictEqual(response.status, 204);

		assert.deepStrictEqual(response.headers.getSetCookie(), ["seniorenzocken.session_token=; Max-Age=0; Path=/"]);
	});

	test("still returns an HTTP 204 status code and deletes the cookie even when deleting the session war rejected", async function () {
		const deleteSession = fake.returns(Task.reject(new Error("test")));
		const { testClient } = createTestClient({ deleteSession });

		const response = await testClient.index.$post(undefined, {
			init: {
				headers: {
					Cookie: "seniorenzocken.session_token=foo-bar"
				}
			}
		});

		sinonAssert.calledOnceWithExactly(deleteSession, "foo-bar");

		assert.strictEqual(response.status, 204);

		assert.deepStrictEqual(response.headers.getSetCookie(), ["seniorenzocken.session_token=; Max-Age=0; Path=/"]);
	});
});
