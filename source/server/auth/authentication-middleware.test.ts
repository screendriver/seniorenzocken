import { describe, it, expect } from "vitest";
import { isUndefined } from "@sindresorhus/is";
import { Hono, type ClientRequestOptions } from "hono";
import { testClient } from "hono/testing";
import { authenticationMiddleware } from "./authentication-middleware.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Hono test client infers all routes
function createTestClient() {
	const server = new Hono().post(
		"/api/authenticate",
		authenticationMiddleware({
			seniorenzockenUsername: "test-username",
			seniorenzockenPassword: "test-password"
		}),
		(context) => {
			return context.text("OK");
		}
	);

	return testClient(server);
}

describe("authentication middleware", () => {
	it.each<{ expectedStatusCode: number; headers: ClientRequestOptions["headers"] }>([
		{ expectedStatusCode: 401, headers: undefined },
		{ expectedStatusCode: 401, headers: { Authorization: "" } },
		{ expectedStatusCode: 401, headers: { Authorization: "Basic" } },
		{ expectedStatusCode: 401, headers: { Authorization: "Basic invalid" } },
		{ expectedStatusCode: 200, headers: { Authorization: "Basic dGVzdC11c2VybmFtZTp0ZXN0LXBhc3N3b3Jk" } }
	])("returns HTTP status $expectedStatusCode when request headers equals $headers", async (testOptions) => {
		const { expectedStatusCode, headers } = testOptions;
		const client = createTestClient();

		const response = await client.api.authenticate.$post(
			{},
			{ ...(isUndefined(headers) ? undefined : { headers }) }
		);

		expect(response.status).toBe(expectedStatusCode);
	});
});
