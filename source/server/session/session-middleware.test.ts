import assert from "node:assert";
import { suite, test } from "mocha";
import { assert as sinonAssert, fake } from "sinon";
import { Hono } from "hono";
import { testClient } from "hono/testing";
import { Task } from "true-myth/task";
import { sessionMiddleware } from "./session-middleware.js";
import type { SessionRepository } from "./session-repository.js";

type SessionRepositoryOverrides = {
	readonly getSession?: SessionRepository["getSession"];
};

function createSessionRepository(overrides: SessionRepositoryOverrides = {}): SessionRepository {
	return {
		getSession:
			overrides.getSession ??
			(() => {
				return Task.reject(new Error("getSession was not expected"));
			})
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

suite("session middleware", function () {
	test("calls next middleware when there is no Cookie present", async function () {
		const client = createTestClient();
		const response = await client.index.$get();

		assert.strictEqual(response.status, 200);

		assert.strictEqual(await response.text(), "OK");
	});

	test("calls next middleware when there is a Cookie present but an invalid one", async function () {
		const getSession = fake.resolves(Task.reject(new Error("Test error")));
		const client = createTestClient({ getSession });
		const response = await client.index.$get(undefined, {
			headers: {
				Cookie: "seniorenzocken.session_token=foobar"
			}
		});

		sinonAssert.calledOnceWithExactly(getSession, "foobar");

		assert.strictEqual(response.status, 200);
		assert.deepStrictEqual(response.headers.getSetCookie(), ["seniorenzocken.session_token=; Max-Age=0; Path=/"]);

		assert.strictEqual(await response.text(), "OK");
	});

	test("calls next middleware when there is a valid Cookie present", async function () {
		const getSession = fake.resolves(Task.resolve({ token: "test-token" }));
		const client = createTestClient({ getSession });
		const response = await client.index.$get(undefined, {
			headers: {
				Cookie: "seniorenzocken.session_token=foobar"
			}
		});

		sinonAssert.calledOnceWithExactly(getSession, "foobar");

		assert.strictEqual(response.status, 200);

		assert.strictEqual(await response.text(), "test-token");
	});
});
