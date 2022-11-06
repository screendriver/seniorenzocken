import { assert, test, type TestFunction } from "vitest";
import { interpret, type InterpreterFrom } from "xstate";
import Maybe from "true-myth/maybe";
import { createWakeLockStateMachine, type WakeLockStateMachine } from "./wake-lock-state-machine.js";

function withWakeLockStateMachineService(
	testFunction: (wakeLockStateMachineService: InterpreterFrom<WakeLockStateMachine>) => void
): TestFunction {
	return () => {
		const wakeLockStateMachine = createWakeLockStateMachine();
		const wakeLockStateMachineService = interpret(wakeLockStateMachine);
		wakeLockStateMachineService.start();

		testFunction(wakeLockStateMachineService);
	};
}

test(
	'wakeLockStateMachine has initial state "notAcquired"',
	withWakeLockStateMachineService((wakeLockStateMachineService) => {
		assert.strictEqual(wakeLockStateMachineService.getSnapshot().value, "notAcquired");
	})
);

test(
	"gameStateMachine has an initial context set",
	withWakeLockStateMachineService((notAcquired) => {
		assert.deepStrictEqual(notAcquired.getSnapshot().context, {
			wakeLockSentinel: Maybe.nothing<WakeLockSentinel>()
		});
	})
);
