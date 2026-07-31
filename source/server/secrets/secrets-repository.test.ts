import assert from "node:assert";
import { suite, test } from "mocha";
import { fake } from "sinon";
import { resolve, reject } from "true-myth/task";
import { isErr, isOk } from "true-myth/result";
import type { SecretsClient } from "./secrets-client.js";
import { createSecretsRepository } from "./secrets-repository.js";

type Overrides = {
	readonly fetchSecret?: SecretsClient["fetchSecret"];
};

function createFakeSecretsClient(overrides: Overrides = {}): SecretsClient {
	return {
		fetchSecret:
			overrides.fetchSecret ??
			(() => {
				return reject(new Error("fetchSecret was not expected"));
			})
	};
}

suite("getSecret()", function () {
	test("returns an Result Err when fetching secret failed", async function () {
		const fetchSecret = fake.returns(reject(new Error("Oh oh")));
		const secretsClient = createFakeSecretsClient({ fetchSecret });
		const secretsRepository = createSecretsRepository({ secretsClient });
		const secretResult = await secretsRepository.getSecret("FOO");

		assert.ok(isErr(secretResult));

		assert.strictEqual(secretResult.error.message, "Oh oh");
	});

	test("returns an Result Ok when fetching secret succeeded", async function () {
		const fetchSecret = fake.returns(resolve("bar"));
		const secretsClient = createFakeSecretsClient({ fetchSecret });
		const secretsRepository = createSecretsRepository({ secretsClient });
		const secretResult = await secretsRepository.getSecret("FOO");

		assert.ok(isOk(secretResult));

		assert.strictEqual(secretResult.value, "bar");
	});
});
