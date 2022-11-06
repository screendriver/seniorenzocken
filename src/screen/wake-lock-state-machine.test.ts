import { assert, test, type TestFunction } from "vitest";
import { interpret, type InterpreterFrom } from "xstate";
import Maybe from "true-myth/maybe";
import { createWakeLockStateMachine, type WakeLockStateMachine } from "./wake-lock-state-machine.js";

function createWakeLock(): WakeLock {
	return {} as unknown as WakeLock;
}

function withWakeLockStateMachineService(
	testFunction: (wakeLockStateMachineService: InterpreterFrom<WakeLockStateMachine>) => void,
	wakeLock: WakeLock
): TestFunction {
	return () => {
		const navigator = { wakeLock } as unknown as Navigator;
		const wakeLockStateMachine = createWakeLockStateMachine(navigator);
		const wakeLockStateMachineService = interpret(wakeLockStateMachine);
		wakeLockStateMachineService.start();

		testFunction(wakeLockStateMachineService);
	};
}

test('wakeLockStateMachine has initial state "wakeLockNotSupported" when navigator does not have a "wakeLock" property', () => {
	const navigator = {} as unknown as Navigator;
	const wakeLockStateMachine = createWakeLockStateMachine(navigator);

	assert.strictEqual(wakeLockStateMachine.initialState.value, "wakeLockNotSupported");
});

test(
	'wakeLockStateMachine has initial state "wakeLockSupported" when navigator does have a "wakeLock" property',
	withWakeLockStateMachineService((wakeLockStateMachineService) => {
		assert.strictEqual(wakeLockStateMachineService.getSnapshot().value, "wakeLockSupported");
	}, createWakeLock())
);

test(
	"wakeLockStateMachine has an initial context set",
	withWakeLockStateMachineService((notAcquired) => {
		assert.deepStrictEqual(notAcquired.getSnapshot().context, {
			wakeLockSentinel: Maybe.nothing<WakeLockSentinel>()
		});
	}, createWakeLock())
);
