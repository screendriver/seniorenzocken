import pRetry, { type Options as RetryOptions, type RetryContext } from "p-retry";
import { isError, isUndefined } from "@sindresorhus/is";
import { Task, fromPromise, tryOrElse } from "true-myth/task";
import { safeParse, summarize } from "valibot";
import type { InitializedInfisicalSDK } from "./infisical/infisical-sdk.js";
import { secretSchema } from "./infisical/secret-schema.js";

export type SecretsClient = {
	readonly fetchSecret: (secretName: string) => Task<string, Error>;
};

type SecretsClientDependencies = {
	readonly infisicalSDK: InitializedInfisicalSDK;
	readonly retryOptions?: Required<
		Pick<RetryOptions, "factor" | "maxRetryTime" | "maxTimeout" | "minTimeout" | "retries">
	>;
	readonly logRetry?: (retryContext: RetryContext) => void;
};

type RetryOptionsWithLogging = {
	readonly logRetry: ((retryContext: RetryContext) => void) | undefined;
	readonly retryOptions: Required<
		Pick<RetryOptions, "factor" | "maxRetryTime" | "maxTimeout" | "minTimeout" | "retries">
	>;
};

type RetriedInfisicalTaskOptions<Value> = RetryOptionsWithLogging & {
	readonly createTask: () => Task<Value, Error>;
};

async function runTaskOrThrow<Value>(task: Task<Value, Error>): Promise<Value> {
	const result = await task;

	return result.unwrapOrElse((error: Error) => {
		throw error;
	});
}

function normalizeUnknownError(errorReason: unknown): Error {
	return isError(errorReason) ? errorReason : new Error("Could not fetch Infisical secret", { cause: errorReason });
}

function createRetryOptions(options: RetryOptionsWithLogging): RetryOptions {
	const { logRetry, retryOptions } = options;

	if (isUndefined(logRetry)) {
		return {
			retries: retryOptions.retries,
			factor: retryOptions.factor,
			minTimeout: retryOptions.minTimeout,
			maxTimeout: retryOptions.maxTimeout,
			maxRetryTime: retryOptions.maxRetryTime
		};
	}

	return {
		retries: retryOptions.retries,
		factor: retryOptions.factor,
		minTimeout: retryOptions.minTimeout,
		maxTimeout: retryOptions.maxTimeout,
		maxRetryTime: retryOptions.maxRetryTime,
		onFailedAttempt: logRetry
	};
}

function runInfisicalTaskWithRetry<Value>(options: RetriedInfisicalTaskOptions<Value>): Task<Value, Error> {
	const { createTask, logRetry, retryOptions } = options;

	const retryOptionsWithLogging = createRetryOptions({ logRetry, retryOptions });
	const retriedInfisicalTaskPromise = pRetry(async () => {
		return runTaskOrThrow(createTask());
	}, retryOptionsWithLogging);

	return fromPromise(retriedInfisicalTaskPromise, normalizeUnknownError);
}

export function createSecretsClient(dependencies: SecretsClientDependencies): SecretsClient {
	const { infisicalSDK, retryOptions, logRetry } = dependencies;

	function withOptionalRetry<Argument, Value>(
		run: (functionArgument: Argument) => Task<Value, Error>
	): (functionArgument: Argument) => Task<Value, Error> {
		if (isUndefined(retryOptions)) {
			return run;
		}

		return (functionArgument) => {
			return runInfisicalTaskWithRetry({
				createTask: () => {
					return run(functionArgument);
				},
				logRetry,
				retryOptions
			});
		};
	}

	return {
		fetchSecret: withOptionalRetry((secretName: string) => {
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
		})
	};
}
