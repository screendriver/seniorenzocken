import { type Task, all } from "true-myth/task";
import type { SecretsClient } from "./secrets-client.js";

type PrometheusSecrets = {
	readonly username: string;
	readonly password: string;
};

export type SecretsRepository = {
	readonly getPrometheusSecrets: () => Task<PrometheusSecrets, Error>;
	readonly getSecret: (secretName: string) => Task<string, Error>;
};

type SecretsClientDependencies = {
	readonly secretsClient: SecretsClient;
};

export function createSecretsRepository(dependencies: SecretsClientDependencies): SecretsRepository {
	const { secretsClient } = dependencies;

	return {
		getPrometheusSecrets() {
			return all([
				secretsClient.fetchSecret("PROMETHEUS_BASIC_AUTH_USERNAME"),
				secretsClient.fetchSecret("PROMETHEUS_BASIC_AUTH_PASSWORD")
			]).map(([username, password]) => {
				return { username, password };
			});
		},

		getSecret(secretName) {
			return secretsClient.fetchSecret(secretName);
		}
	};
}
