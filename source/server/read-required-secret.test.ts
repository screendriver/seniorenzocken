import assert from "node:assert";
import { suite, test } from "mocha";
import { readRequiredSecret } from "./read-required-secret.js";

type ReadUtf8File = (secretFilePath: string, encoding: "utf8") => Promise<string>;

suite("readRequiredSecret()", function () {
	test("preserves the secret value including surrounding whitespace", async function () {
		const readUtf8File: ReadUtf8File = async function () {
			return " secret with whitespace \n";
		};

		const actualSecretValue = await readRequiredSecret("/run/secrets/example", readUtf8File);

		const expectedSecretValue = " secret with whitespace \n";
		assert.strictEqual(actualSecretValue, expectedSecretValue);
	});

	test("rejects an empty secret with the file path", async function () {
		const readUtf8File: ReadUtf8File = async function () {
			return "";
		};

		await assert.rejects(readRequiredSecret("/run/secrets/example", readUtf8File), {
			message: 'Required secret file "/run/secrets/example" is empty'
		});
	});

	test("wraps read failures without exposing a secret value", async function () {
		const readUtf8File: ReadUtf8File = async function () {
			throw new Error("read failed");
		};

		await assert.rejects(readRequiredSecret("/run/secrets/example", readUtf8File), {
			message: 'Could not read required secret file "/run/secrets/example"'
		});
	});
});
