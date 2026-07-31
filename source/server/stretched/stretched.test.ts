import assert from "node:assert";
import { suite, test } from "mocha";
import { isStretched } from "./stretched.js";

suite("isStretched()", function () {
	test("returns false when given match total game points equals 0", function () {
		assert.strictEqual(isStretched(0), false);
	});

	test("returns false when given match total game points equals 11", function () {
		assert.strictEqual(isStretched(11), false);
	});

	test("returns true when given match total game points equals 12", function () {
		assert.strictEqual(isStretched(12), true);
	});

	test("returns true when given match total game points is greater than 12", function () {
		assert.strictEqual(isStretched(13), true);
	});
});
