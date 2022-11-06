import { assert, test, vi, type Mock } from "vitest";
import { interpret, type InterpreterFrom, type StateValue } from "xstate";
import Maybe from "true-myth/maybe";
import timers from "node:timers/promises";
import { createWakeLockStateMachine, type WakeLockStateMachine } from "./wake-lock-state-machine.js";

function createWakeLock(request?: Mock<"screen"[], Promise<WakeLockSentinel>>): WakeLock {
	return {
		request: request ?? vi.fn().mockRejectedValue("Not implemented")
	} as unknown as WakeLock;
}

function createDocument(
	addEventListener?: Mock,
	removeEventListener?: Mock,
	visibilityState: "hidden" | "visible" = "hidden"
): Document {
	return {
		addEventListener: addEventListener ?? vi.fn(),
		removeEventListener: removeEventListener ?? vi.fn(),
		visibilityState
	} as unknown as Document;
}

function createAndStartWakeLockStateMachine(
	wakeLock: WakeLock,
	document: Document
): InterpreterFrom<WakeLockStateMachine> {
	const navigator = { wakeLock } as unknown as Navigator;
	const wakeLockStateMachine = createWakeLockStateMachine(navigator, document);
	const wakeLockStateMachineService = interpret(wakeLockStateMachine);
	wakeLockStateMachineService.start();

	return wakeLockStateMachineService;
}

test('wakeLockStateMachine has initial state "wakeLockNotSupported" when navigator does not have a "wakeLock" property set and defines it as a final state node', () => {
	const navigator = {} as unknown as Navigator;
	const document = createDocument();
	const wakeLockStateMachine = createWakeLockStateMachine(navigator, document);
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
	const document = createDocument();
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	assert.deepStrictEqual(service.getSnapshot().context, {
		wakeLockSentinel: Maybe.nothing<WakeLockSentinel>()
	});
});

test('wakeLockStateMachine has initial state "wakeLockSupported" when navigator does have a "wakeLock" property', () => {
	const wakeLock = createWakeLock();
	const document = createDocument();
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	assert.strictEqual(service.getSnapshot().value, "wakeLockSupported");
});

test('wakeLockStateMachine invokes requestWakeLock when entering "wakeLockSupported" and transit to "acquired" when request was successful', async () => {
	const request = vi.fn().mockResolvedValue({
		addEventListener: vi.fn()
	});
	const wakeLock = createWakeLock(request);
	const document = createDocument();
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	await timers.setImmediate();

	assert.strictEqual(service.getSnapshot().value, "acquired");
});

test("wakeLockStateMachine sets wake lock sentinel in context when requestWakeLock invocation was successful", async () => {
	const wakeLockSentinel = {
		addEventListener: vi.fn()
	} as unknown as WakeLockSentinel;
	const document = createDocument();
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	await timers.setImmediate();

	assert.deepStrictEqual(service.getSnapshot().context.wakeLockSentinel, Maybe.just(wakeLockSentinel));
});

test('wakeLockStateMachine invokes requestWakeLock when entering "wakeLockSupported" and transit to "acquisitionError" when request was not successful', async () => {
	const request = vi.fn().mockRejectedValue(new Error("Not allowed"));
	const wakeLock = createWakeLock(request);
	const document = createDocument();
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	await timers.setImmediate();

	assert.strictEqual(service.getSnapshot().value, "acquisitionError");
});

test('wakeLockStateMachine invokes a release listener and attaches an event listener for the "release" event on the wacke lock sentinel', async () => {
	const addEventListener = vi.fn();
	const wakeLockSentinel = {
		addEventListener
	} as unknown as WakeLockSentinel;
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const document = createDocument();
	createAndStartWakeLockStateMachine(wakeLock, document);

	await timers.setImmediate();

	assert.strictEqual(addEventListener.mock.calls.length, 1);
	assert.deepStrictEqual(addEventListener.mock.calls[0]?.[0], "release");
});

test('wakeLockStateMachine release listener sends an "WAKE_LOCK_RELEASED" event when "release" event gets triggered', async () => {
	const addEventListener = vi.fn<[string, () => void], void>((eventName, callback) => {
		if (eventName === "release") {
			callback();
		}
	});
	const wakeLockSentinel = {
		addEventListener,
		removeEventListener: vi.fn()
	} as unknown as WakeLockSentinel;
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const document = createDocument();
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	let wakeLockReleasedEventFired = false;
	service.onEvent((event) => {
		if (event.type === "WAKE_LOCK_RELEASED") {
			wakeLockReleasedEventFired = true;
		}
	});

	await timers.setImmediate();

	assert.isTrue(wakeLockReleasedEventFired);
});

test('wakeLockStateMachine release listener calls cleanup function when "acquired" state is exited', async () => {
	const addEventListener = vi.fn<[string, () => void], void>((_eventName, callback) => {
		callback();
	});
	const removeEventListener = vi.fn();
	const wakeLockSentinel = {
		addEventListener,
		removeEventListener
	} as unknown as WakeLockSentinel;
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const document = createDocument();
	createAndStartWakeLockStateMachine(wakeLock, document);

	await timers.setImmediate();

	assert.strictEqual(removeEventListener.mock.calls.length, 1);
	assert.strictEqual(removeEventListener.mock.lastCall?.[0], "release");
});

test('wakeLockStateMachine release listener resets wake lock sentinel in context when "acquired" state is exited', async () => {
	const addEventListener = vi.fn<[string, () => void], void>((_eventName, callback) => {
		callback();
	});
	const wakeLockSentinel = {
		addEventListener,
		removeEventListener: vi.fn()
	} as unknown as WakeLockSentinel;
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const document = createDocument();
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	await timers.setImmediate();

	assert.deepStrictEqual(service.getSnapshot().context.wakeLockSentinel, Maybe.nothing());
});

test('wakeLockStateMachine release listener transit to "wakeLockReleased" state node', async () => {
	const addEventListener = vi.fn<[string, () => void], void>((_eventName, callback) => {
		callback();
	});
	const wakeLockSentinel = {
		addEventListener,
		removeEventListener: vi.fn()
	} as unknown as WakeLockSentinel;
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const document = createDocument();
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	await timers.setImmediate();

	assert.strictEqual(service.getSnapshot().value, "wakeLockReleased");
});

test('wakeLockStateMachine adds "visibilitychange" event listener to the document when entering "wakeLockReleased" state node', async () => {
	const wakeLockSentinelAddEventListener = vi.fn<[string, () => void], void>((_eventName, callback) => {
		callback();
	});
	const wakeLockSentinel = {
		addEventListener: wakeLockSentinelAddEventListener,
		removeEventListener: vi.fn()
	} as unknown as WakeLockSentinel;
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const addEventListener = vi.fn();
	const document = createDocument(addEventListener);
	createAndStartWakeLockStateMachine(wakeLock, document);

	await timers.setImmediate();

	assert.strictEqual(addEventListener.mock.calls.length, 1);
});

test('wakeLockStateMachine fires "REACQUIRE_WAKE_LOCK" event when entering "wakeLockReleased" state node and document has a visibility state equal to "visible"', async () => {
	const wakeLockSentinelAddEventListener = vi
		.fn<[string, () => void], void>()
		.mockImplementationOnce((_eventName, callback) => {
			callback();
		});
	const wakeLockSentinel = {
		addEventListener: wakeLockSentinelAddEventListener,
		removeEventListener: vi.fn()
	} as unknown as WakeLockSentinel;
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const addEventListener = vi.fn<[string, () => void], void>((eventName, callback) => {
		if (eventName === "visibilitychange") {
			callback();
		}
	});
	const removeEventListener = vi.fn();
	const document = createDocument(addEventListener, removeEventListener, "visible");
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	let reacquireWakeLockEventFired = false;
	service.onEvent((event) => {
		if (event.type === "REACQUIRE_WAKE_LOCK") {
			reacquireWakeLockEventFired = true;
		}
	});

	await timers.setImmediate();

	assert.isTrue(reacquireWakeLockEventFired);
});

test('wakeLockStateMachine does not fire "REACQUIRE_WAKE_LOCK" event when entering "wakeLockReleased" state node and document has a visibility state not equal to "visible"', async () => {
	const wakeLockSentinelAddEventListener = vi
		.fn<[string, () => void], void>()
		.mockImplementationOnce((_eventName, callback) => {
			callback();
		});
	const wakeLockSentinel = {
		addEventListener: wakeLockSentinelAddEventListener,
		removeEventListener: vi.fn()
	} as unknown as WakeLockSentinel;
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const addEventListener = vi.fn<[string, () => void], void>((eventName, callback) => {
		if (eventName === "visibilitychange") {
			callback();
		}
	});
	const removeEventListener = vi.fn();
	const document = createDocument(addEventListener, removeEventListener, "hidden");
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	let reacquireWakeLockEventFired = false;
	service.onEvent((event) => {
		if (event.type === "REACQUIRE_WAKE_LOCK") {
			reacquireWakeLockEventFired = true;
		}
	});

	await timers.setImmediate();

	assert.isFalse(reacquireWakeLockEventFired);
});

test('wakeLockStateMachine calls cleanup function when "wakeLockReleased" state is exited', async () => {
	const wakeLockSentinelAddEventListener = vi
		.fn<[string, () => void], void>()
		.mockImplementationOnce((_eventName, callback) => {
			callback();
		});
	const wakeLockSentinel = {
		addEventListener: wakeLockSentinelAddEventListener,
		removeEventListener: vi.fn()
	} as unknown as WakeLockSentinel;
	const request = vi.fn<"screen"[], Promise<WakeLockSentinel>>().mockResolvedValue(wakeLockSentinel);
	const wakeLock = createWakeLock(request);
	const addEventListener = vi.fn<[string, () => void], void>((_eventName, callback) => {
		callback();
	});
	const removeEventListener = vi.fn();
	const document = createDocument(addEventListener, removeEventListener, "visible");
	createAndStartWakeLockStateMachine(wakeLock, document);

	await timers.setImmediate();

	assert.strictEqual(removeEventListener.mock.calls.length, 1);
});

test('wakeLockStateMachine enters "wakeLockSupported" when in "wakeLockReleased" state and "REACQUIRE_WAKE_LOCK" is fired', async () => {
	const wakeLockSentinelAddEventListener = vi
		.fn<[string, () => void], void>()
		.mockImplementationOnce((_eventName, callback) => {
			callback();
		});
	const wakeLockSentinel = {
		addEventListener: wakeLockSentinelAddEventListener,
		removeEventListener: vi.fn()
	} as unknown as WakeLockSentinel;
	const request = vi
		.fn<"screen"[], Promise<WakeLockSentinel>>()
		.mockResolvedValueOnce(wakeLockSentinel)
		.mockRejectedValue({});
	const wakeLock = createWakeLock(request);
	const addEventListener = vi.fn<[string, () => void], void>((_eventName, callback) => {
		callback();
	});
	const removeEventListener = vi.fn();
	const document = createDocument(addEventListener, removeEventListener, "visible");
	const service = createAndStartWakeLockStateMachine(wakeLock, document);

	const stateNodes: StateValue[] = [];

	service.onTransition((state) => {
		stateNodes.push(state.value);
	});

	await timers.setImmediate();

	assert.deepStrictEqual(stateNodes, [
		"wakeLockSupported",
		"acquired",
		"wakeLockReleased",
		"wakeLockSupported",
		"acquisitionError"
	]);
});
