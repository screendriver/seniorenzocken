import assert from "node:assert";
import { suite, test } from "mocha";
import * as React from "react";
import { redirectAuthenticatedSessionFromSignIn, redirectUnauthenticatedSession } from "./router.js";
import { installReactGlobal } from "./test-support/mocha-jsdom.js";

installReactGlobal(React);

suite("redirectUnauthenticatedSession()", function () {
	test("redirects to teams when there is no session token", function () {
		const redirectResponse = redirectUnauthenticatedSession(null);

		assert.ok(redirectResponse instanceof Response);
		assert.strictEqual(redirectResponse.headers.get("Location"), "/teams");
	});

	test("does not redirect when there is a session token", function () {
		const redirectResponse = redirectUnauthenticatedSession("session-token");

		assert.strictEqual(redirectResponse, null);
	});
});

suite("redirectAuthenticatedSessionFromSignIn()", function () {
	test("redirects to teams selection when there is a session token", function () {
		const redirectResponse = redirectAuthenticatedSessionFromSignIn("session-token");

		assert.ok(redirectResponse instanceof Response);
		assert.strictEqual(redirectResponse.headers.get("Location"), "/teams-selection");
	});

	test("does not redirect when there is no session token", function () {
		const redirectResponse = redirectAuthenticatedSessionFromSignIn(null);

		assert.strictEqual(redirectResponse, null);
	});
});
