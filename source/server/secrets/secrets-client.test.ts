import assert from "node:assert";
import { suite, test } from "mocha";
import { assert as sinonAssert, fake, stub } from "sinon";
import { isErr, isOk } from "true-myth/result";
import { stripIndent } from "common-tags";
import type { InitializedInfisicalSDK } from "./infisical/infisical-sdk.js";
import { createSecretsClient } from "./secrets-client.js";

type Overrides = {
	readonly listSecrets?: ReturnType<InitializedInfisicalSDK["secrets"]>["listSecrets"];
	readonly getSecret?: ReturnType<InitializedInfisicalSDK["secrets"]>["getSecret"];
};

function createFakeInfisicalSDK(overrides: Overrides = {}): InitializedInfisicalSDK {
	return {
		secrets: () => {
			return {
				listSecrets:
					overrides.listSecrets ??
					(async () => {
						return [];
					}),
				getSecret:
					overrides.getSecret ??
					(async () => {
						return {};
					})
			};
		}
	} as unknown as InitializedInfisicalSDK;
}

suite("fetchSecret()", function () {
	test("returns an Result Err when infisical request fails", async function () {
		const getSecret = fake.rejects(new Error("Oh oh"));
		const fakeInfisicalSDK = createFakeInfisicalSDK({ getSecret });
		const secretsClient = createSecretsClient({ infisicalSDK: fakeInfisicalSDK });

		const result = await secretsClient.fetchSecret("FOO");

		assert.ok(isErr(result));

		assert.strictEqual(result.error.message, 'Could not fetch "FOO" secret');
	});

	test("returns an Result Err when infisical does not respond with the expected data", async function () {
		const getSecret = fake.resolves({ secrets: "not-expected" });
		const fakeInfisicalSDK = createFakeInfisicalSDK({ getSecret });
		const secretsClient = createSecretsClient({ infisicalSDK: fakeInfisicalSDK });

		const result = await secretsClient.fetchSecret("FOO");

		assert.ok(isErr(result));

		assert.strictEqual(
			result.error.message,
			stripIndent`
				× Invalid key: Expected "secretValue" but received undefined
				  → at secretValue`
		);
	});

	test("returns an Result Ok when infisical responds with the expected data", async function () {
		const getSecret = fake.resolves({
			secretKey: "FOO",
			secretValue: "bar"
		});
		const fakeInfisicalSDK = createFakeInfisicalSDK({ getSecret });
		const secretsClient = createSecretsClient({ infisicalSDK: fakeInfisicalSDK });

		const result = await secretsClient.fetchSecret("FOO");

		assert.ok(isOk(result));

		assert.strictEqual(result.value, "bar");
	});

	test("retries when fetching the secret fails temporarily", async function () {
		const getSecret = stub().onFirstCall().rejects(new Error("Infisical is starting")).onSecondCall().resolves({
			secretKey: "FOO",
			secretValue: "bar"
		});
		const retryContexts: unknown[] = [];
		const logRetry = (retryContext: unknown): void => {
			retryContexts.push(retryContext);
		};
		const fakeInfisicalSDK = createFakeInfisicalSDK({ getSecret });
		const secretsClient = createSecretsClient({
			infisicalSDK: fakeInfisicalSDK,
			retryOptions: {
				retries: 1,
				minTimeout: 0,
				maxTimeout: 0,
				maxRetryTime: 1000,
				factor: 1
			},
			logRetry
		});

		const result = await secretsClient.fetchSecret("FOO");

		assert.ok(isOk(result));

		assert.strictEqual(result.value, "bar");
		sinonAssert.callCount(getSecret, 2);
		assert.strictEqual(retryContexts.length, 1);
	});

	test("uses the correct options when calling getSecret()", async function () {
		const getSecret = fake.resolves({});
		const fakeInfisicalSDK = createFakeInfisicalSDK({ getSecret });
		const secretsClient = createSecretsClient({ infisicalSDK: fakeInfisicalSDK });

		await secretsClient.fetchSecret("FOO");

		sinonAssert.calledOnceWithExactly(getSecret, {
			environment: "production",
			projectId: "18270c59-19de-480c-9c14-a99fda39c0db",
			secretName: "FOO"
		});
	});
});
