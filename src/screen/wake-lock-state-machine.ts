import { createMachine, type StateMachine, type StateSchema } from "xstate";
import Maybe from "true-myth/maybe";

export interface WakeLockStateMachineContext {
	readonly wakeLockSentinel: Maybe<WakeLockSentinel>;
}

export type WakeLockStateMachineEvent = { readonly type: "" };

export type WakeLockStateMachineState = {
	readonly value: "notAcquired";
	readonly context: WakeLockStateMachineContext;
};

export type WakeLockStateMachine = StateMachine<
	WakeLockStateMachineContext,
	StateSchema<WakeLockStateMachineContext>,
	WakeLockStateMachineEvent,
	WakeLockStateMachineState
>;

export function createWakeLockStateMachine(): WakeLockStateMachine {
	return createMachine<WakeLockStateMachineContext, WakeLockStateMachineEvent, WakeLockStateMachineState>({
		id: "wakeLock",
		initial: "notAcquired",
		predictableActionArguments: true,
		context: {
			wakeLockSentinel: Maybe.nothing()
		},
		states: {
			notAcquired: {}
		}
	}) as WakeLockStateMachine;
}
