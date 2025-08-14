import { Task, tryOrElse } from "true-myth/task";
import { safeParse, summarize } from "valibot";
import type { InitializedInfisicalSDK } from "./infisical/infisical-sdk.js";
import { secretSchema } from "./infisical/secret-schema.js";

export type SecretsClient = {
	readonly fetchSecret: (secretName: string) => Task<string, Error>;
};

type SecretsClientDependencies = {
	readonly infisicalSDK: InitializedInfisicalSDK;
};

export function createSecretsClient(dependencies: SecretsClientDependencies): SecretsClient {
	const { infisicalSDK } = dependencies;

	return {
		fetchSecret(secretName) {
			return tryOrElse(
				(errorReason) => {
					return new Error(`Could not fetch "${secretName}" secret`, { cause: errorReason });
				},
				async () => {
					return infisicalSDK.secrets().getSecret({
						environment: "production",
						projectId: "18270c59-19de-480c-9c14-a99fda39c0db",
						secretName
					});
				}
			)
				.andThen((secretResponse) => {
					const parseResult = safeParse(secretSchema, secretResponse);

					if (parseResult.success) {
						return Task.resolve(parseResult.output);
					}

					const errorMessage = summarize(parseResult.issues);

					return Task.reject(new Error(errorMessage));
				})
				.map((secret) => {
					return secret.secretValue;
				});
		}
	};
}
