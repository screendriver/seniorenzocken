import { describe, it, expect, assert, vi, type Mock } from "vitest";
import { isErr, isOk } from "true-myth/result";
import { stripIndent } from "common-tags";
import type { InitializedInfisicalSDK } from "./infisical/infisical-sdk.js";
import { createSecretsClient } from "./secrets-client.js";

type Overrides = {
	readonly listSecrets?: Mock;
	readonly getSecret?: Mock;
};

function createFakeInfisicalSDK(overrides: Overrides = {}): InitializedInfisicalSDK {
	return {
		secrets: vi.fn().mockReturnValue({
			listSecrets: overrides.listSecrets ?? vi.fn().mockReturnValue([{}, {}]),
			getSecret: overrides.getSecret ?? vi.fn().mockReturnValue({})
		})
	} as unknown as InitializedInfisicalSDK;
}

describe("fetchSecret()", () => {
	it("returns an Result Err when infisical request fails", async () => {
		const getSecret = vi.fn().mockRejectedValue(new Error("Oh oh"));
		const fakeInfisicalSDK = createFakeInfisicalSDK({ getSecret });
		const secretsClient = createSecretsClient({ infisicalSDK: fakeInfisicalSDK });

		const result = await secretsClient.fetchSecret("FOO");

		assert(isErr(result));

		expect(result.error.message).toBe('Could not fetch "FOO" secret');
	});

	it("returns an Result Err when infisical does not respond with the expected data", async () => {
		const getSecret = vi.fn().mockResolvedValue({ secrets: "not-expected" });
		const fakeInfisicalSDK = createFakeInfisicalSDK({ getSecret });
		const secretsClient = createSecretsClient({ infisicalSDK: fakeInfisicalSDK });

		const result = await secretsClient.fetchSecret("FOO");

		assert(isErr(result));

		expect(result.error.message).toBe(
			stripIndent`
				× Invalid key: Expected "secretValue" but received undefined
				  → at secretValue`
		);
	});

	it("returns an Result Ok when infisical responds with the expected data", async () => {
		const getSecret = vi.fn().mockResolvedValue({
			secretKey: "FOO",
			secretValue: "bar"
		});
		const fakeInfisicalSDK = createFakeInfisicalSDK({ getSecret });
		const secretsClient = createSecretsClient({ infisicalSDK: fakeInfisicalSDK });

		const result = await secretsClient.fetchSecret("FOO");

		assert(isOk(result));

		expect(result.value).toBe("bar");
	});

	it("uses the correct options when calling getSecret()", async () => {
		const getSecret = vi.fn().mockResolvedValue({});
		const fakeInfisicalSDK = createFakeInfisicalSDK({ getSecret });
		const secretsClient = createSecretsClient({ infisicalSDK: fakeInfisicalSDK });

		await secretsClient.fetchSecret("FOO");

		expect(getSecret).toHaveBeenCalledExactlyOnceWith({
			environment: "production",
			projectId: "18270c59-19de-480c-9c14-a99fda39c0db",
			secretName: "FOO"
		});
	});
});
