import assert from "node:assert";
import { suite, test } from "mocha";
import { assert as sinonAssert, fake } from "sinon";
import { createFireAndForgetExecutor } from "./fire-and-forget-executor.js";

suite("createFireAndForgetExecutor()", function () {
	test("executes the asynchronous function", function () {
		const asynchronousFunction = fake.resolves(undefined);
		const logErrorFake = fake<[string, unknown], undefined>();
		function logError(message: string, error: unknown): void {
			logErrorFake(message, error);
		}
		const fireAndForgetExecutor = createFireAndForgetExecutor({ logError });

		fireAndForgetExecutor.execute(asynchronousFunction);

		sinonAssert.calledOnceWithExactly(asynchronousFunction);
		sinonAssert.notCalled(logErrorFake);
	});

	test("logs errors from rejected promises", async function () {
		const rejectedPromise = Promise.reject(new Error("boom"));
		const asynchronousFunction = fake(async () => {
			return rejectedPromise;
		});
		const logErrorFake = fake<[string, unknown], undefined>();
		function logError(message: string, error: unknown): void {
			logErrorFake(message, error);
		}
		const fireAndForgetExecutor = createFireAndForgetExecutor({ logError });

		fireAndForgetExecutor.execute(asynchronousFunction);

		await assert.rejects(rejectedPromise, /boom/u);

		await fireAndForgetExecutor.waitUntilAllSettled();

		sinonAssert.calledOnce(logErrorFake);
		const [message, error] = logErrorFake.firstCall.args;
		assert.strictEqual(message, "failed to execute a fire and forget promise");
		assert.ok(error instanceof Error);
	});
});
