import { describe, it, expect, vi } from "vitest";
import { createFireAndForgetExecutor } from "./fire-and-forget-executor.js";

describe("createFireAndForgetExecutor()", () => {
	it("executes the asynchronous function", () => {
		const asynchronousFunction = vi.fn().mockResolvedValue(undefined);
		const logErrorFake = vi.fn();
		function logError(message: string, error: unknown): void {
			logErrorFake(message, error);
		}
		const fireAndForgetExecutor = createFireAndForgetExecutor({ logError });

		fireAndForgetExecutor.execute(asynchronousFunction);

		expect(asynchronousFunction).toHaveBeenCalledExactlyOnceWith();
		expect(logErrorFake).not.toHaveBeenCalled();
	});

	it("logs errors from rejected promises", async () => {
		const rejectedPromise = Promise.reject(new Error("boom"));
		const asynchronousFunction = vi.fn().mockImplementation(async () => {
			return rejectedPromise;
		});
		const logErrorFake = vi.fn();
		function logError(message: string, error: unknown): void {
			logErrorFake(message, error);
		}
		const fireAndForgetExecutor = createFireAndForgetExecutor({ logError });

		fireAndForgetExecutor.execute(asynchronousFunction);

		await expect(rejectedPromise).rejects.toThrow("boom");

		await fireAndForgetExecutor.waitUntilAllSettled();

		expect(logErrorFake).toHaveBeenCalledExactlyOnceWith(
			"failed to execute a fire and forget promise",
			expect.any(Error)
		);
	});
});
