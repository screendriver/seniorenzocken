import { assert, test, vi, type Mock } from "vitest";
import { interpret, type InterpreterFrom } from "xstate";
import Maybe from "true-myth/maybe";
import timers from "node:timers/promises";
import { createWakeLockStateMachine, type WakeLockStateMachine } from "./wake-lock-state-machine.js";

function createWakeLock(request?: Mock<"screen"[], Promise<WakeLockSentinel>>): WakeLock {
	return {
		request: request ?? vi.fn().mockRejectedValue("Not implemented")
	} as unknown as WakeLock;
}

function createAndStartWakeLockStateMachine(wakeLock: WakeLock): InterpreterFrom<WakeLockStateMachine> {
	const navigator = { wakeLock } as unknown as Navigator;
	const wakeLockStateMachine = createWakeLockStateMachine(navigator);
	const wakeLockStateMachineService = interpret(wakeLockStateMachine);
	wakeLockStateMachineService.start();

	return wakeLockStateMachineService;
}

test('wakeLockStateMachine has initial state "wakeLockNotSupported" when navigator does not have a "wakeLock" property set and defines it as a final state node', () => {
	const navigator = {} as unknown as Navigator;
	const wakeLockStateMachine = createWakeLockStateMachine(navigator);
	const wakeLockStateMachineService = interpret(wakeLockStateMachine);

	let isFinalStateNode = false;
	wakeLockStateMachineService.onDone(() => {
		isFinalStateNode = true;
	});

	wakeLockStateMachineService.start();

	assert.strictEqual(wakeLockStateMachineService.getSnapshot().value, "wakeLockNotSupported");
	assert.isTrue(isFinalStateNode);
});

test("wakeLockStateMachine has an initial context set", () => {
	const wakeLock = createWakeLock();
	const service = createAndStartWakeLockStateMachine(wakeLock);

	assert.deepStrictEqual(service.getSnapshot().context, {
		wakeLockSentinel: Maybe.nothing<WakeLockSentinel>()
	});
});

test('wakeLockStateMachine has initial state "wakeLockSupported" when navigator does have a "wakeLock" property', () => {
	const wakeLock = createWakeLock();
	const service = createAndStartWakeLockStateMachine(wakeLock);

	assert.strictEqual(service.getSnapshot().value, "wakeLockSupported");
});

test('wakeLockStateMachine invokes requestWakeLock when entering "wakeLockSupported" and transit to "acquired" when request was successful', async () => {
	const request = vi.fn().mockResolvedValue({});
	const wakeLock = createWakeLock(request);
	const service = createAndStartWakeLockStateMachine(wakeLock);

	await timers.setImmediate();

	assert.strictEqual(service.getSnapshot().value, "acquired");
});

test("wakeLockStateMachine sets wake lock sentinel in context when requestWakeLock invocation was successful", async () => {
	const wakeLockSentinel = {} as unknown as WakeLockSentinel;
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const service = createAndStartWakeLockStateMachine(wakeLock);

	await timers.setImmediate();

	assert.deepStrictEqual(service.getSnapshot().context.wakeLockSentinel, Maybe.just(wakeLockSentinel));
});
