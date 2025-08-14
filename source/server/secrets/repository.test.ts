import { describe, it, expect, assert, vi, type Mock } from "vitest";
import Task from "true-myth/task";
import { isErr, isOk } from "true-myth/result";
import type { SecretsClient } from "./client.js";
import { createSecretsRepository } from "./repository.js";

type Overrides = {
	readonly fetchSecret?: Mock;
};

function createFakeSecretsClient(overrides: Overrides = {}): SecretsClient {
	return {
		fetchSecret: overrides.fetchSecret ?? vi.fn()
	};
}

describe("getPrometheusSecrets()", () => {
	it("returns an Result Err when fetching secrets failed", async () => {
		const fetchSecret = vi.fn().mockReturnValue(Task.reject(new Error("Oh oh")));
		const secretsClient = createFakeSecretsClient({ fetchSecret });
		const secretsRepository = createSecretsRepository({ secretsClient });
		const secretResult = await secretsRepository.getPrometheusSecrets();

		assert(isErr(secretResult));

		expect(secretResult.error.message).toBe("Oh oh");
	});

	it("returns an Result Ok when fetching secret succeeded", async () => {
		const fetchSecret = vi.fn().mockReturnValueOnce(Task.resolve("foo")).mockReturnValueOnce(Task.resolve("bar"));
		const secretsClient = createFakeSecretsClient({ fetchSecret });
		const secretsRepository = createSecretsRepository({ secretsClient });
		const secretResult = await secretsRepository.getPrometheusSecrets();

		assert(isOk(secretResult));

		expect(secretResult.value).toStrictEqual({ username: "foo", password: "bar" });
	});
});
