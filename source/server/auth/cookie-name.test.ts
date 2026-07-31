import assert from "node:assert";
import { suite, test } from "mocha";
import { cookieName } from "./cookie-name.js";

suite("cookieName", function () {
	test("has the correct name", function () {
		assert.strictEqual(cookieName, "seniorenzocken.session_token");
	});
});
