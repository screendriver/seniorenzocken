import { createMachine, type StateMachine, type StateSchema } from "xstate";
import Maybe from "true-myth/maybe";
import { isWakeLockSupported } from "./wake-lock";

export interface WakeLockStateMachineContext {
	readonly wakeLockSentinel: Maybe<WakeLockSentinel>;
}

export type WakeLockStateMachineEvent = { readonly type: "" };

export type WakeLockStateMachineState =
	| {
			readonly value: "notAcquired";
			readonly context: WakeLockStateMachineContext;
	  }
	| { readonly value: "wakeLockSupported"; readonly context: WakeLockStateMachineContext }
	| { readonly value: "wakeLockNotSupported"; readonly context: WakeLockStateMachineContext };

export type WakeLockStateMachine = StateMachine<
	WakeLockStateMachineContext,
	StateSchema<WakeLockStateMachineContext>,
	WakeLockStateMachineEvent,
	WakeLockStateMachineState
>;

export function createWakeLockStateMachine(navigator: Navigator): WakeLockStateMachine {
	return createMachine<WakeLockStateMachineContext, WakeLockStateMachineEvent, WakeLockStateMachineState>(
		{
			id: "wakeLock",
			initial: "notAcquired",
			predictableActionArguments: true,
			context: {
				wakeLockSentinel: Maybe.nothing()
			},
			states: {
				notAcquired: {
					always: [
						{
							target: "wakeLockSupported",
							cond: "isWakeLockSupported"
						},
						{ target: "wakeLockNotSupported" }
					]
				},
				wakeLockSupported: {},
				wakeLockNotSupported: {
					type: "final"
				}
			}
		},
		{
			guards: {
				isWakeLockSupported() {
					return isWakeLockSupported(navigator);
				}
			}
		}
	) as WakeLockStateMachine;
}
