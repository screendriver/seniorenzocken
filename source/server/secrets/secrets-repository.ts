import type { Task } from "true-myth/task";
import type { SecretsClient } from "./secrets-client.js";

export type SecretsRepository = {
	readonly getSecret: (secretName: string) => Task<string, Error>;
};

type SecretsClientDependencies = {
	readonly secretsClient: SecretsClient;
};

export function createSecretsRepository(dependencies: SecretsClientDependencies): SecretsRepository {
	const { secretsClient } = dependencies;

	return {
		getSecret(secretName) {
			return secretsClient.fetchSecret(secretName);
		}
	};
}
