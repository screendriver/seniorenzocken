import { describe, it, expect, assert, vi, type Mock } from "vitest";
import { resolve, reject } from "true-myth/task";
import { isErr, isOk } from "true-myth/result";
import type { SecretsClient } from "./secrets-client.js";
import { createSecretsRepository } from "./secrets-repository.js";

type Overrides = {
	readonly fetchSecret?: Mock;
};

function createFakeSecretsClient(overrides: Overrides = {}): SecretsClient {
	return {
		fetchSecret: overrides.fetchSecret ?? vi.fn()
	};
}

describe("getSecret()", () => {
	it("returns an Result Err when fetching secret failed", async () => {
		const fetchSecret = vi.fn().mockReturnValue(reject(new Error("Oh oh")));
		const secretsClient = createFakeSecretsClient({ fetchSecret });
		const secretsRepository = createSecretsRepository({ secretsClient });
		const secretResult = await secretsRepository.getSecret("FOO");

		assert(isErr(secretResult));

		expect(secretResult.error.message).toBe("Oh oh");
	});

	it("returns an Result Ok when fetching secret succeeded", async () => {
		const fetchSecret = vi.fn().mockReturnValue(resolve("bar"));
		const secretsClient = createFakeSecretsClient({ fetchSecret });
		const secretsRepository = createSecretsRepository({ secretsClient });
		const secretResult = await secretsRepository.getSecret("FOO");

		assert(isOk(secretResult));

		expect(secretResult.value).toBe("bar");
	});
});
