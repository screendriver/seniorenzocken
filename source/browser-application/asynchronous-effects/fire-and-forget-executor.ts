export type FireAndForgetExecutor = {
	readonly execute: (asynchronousFunction: () => Promise<void>) => void;
	readonly waitUntilAllSettled: () => Promise<void>;
};

type FireAndForgetExecutorDependencies = {
	readonly logError: (message: string, error: unknown) => void;
};

export function createFireAndForgetExecutor(dependencies: FireAndForgetExecutorDependencies): FireAndForgetExecutor {
	const { logError } = dependencies;
	const pendingPromises = new Set<Promise<void>>();

	return {
		execute(asynchronousFunction) {
			const promise = asynchronousFunction();

			pendingPromises.add(promise);

			// eslint-disable-next-line promise/catch-or-return -- fire and forget work must not block the caller
			promise
				// eslint-disable-next-line promise/prefer-await-to-then -- we explicitly do not await fire and forget work here
				.catch((error: unknown) => {
					logError("failed to execute a fire and forget promise", error);
				})
				// eslint-disable-next-line promise/prefer-await-to-then -- promise lifecycle bookkeeping must run without awaiting the task
				.finally(() => {
					pendingPromises.delete(promise);
				});
		},
		async waitUntilAllSettled() {
			await Promise.allSettled(Array.from(pendingPromises));
		}
	};
}
