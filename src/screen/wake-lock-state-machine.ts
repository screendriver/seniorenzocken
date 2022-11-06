import { assign, createMachine, type DoneInvokeEvent, type StateMachine, type StateSchema } from "xstate";
import Maybe, { type Just, type Nothing } from "true-myth/maybe";
import type Result from "true-myth/result";
import { isWakeLockSupported, requestWakeLock } from "./wake-lock.js";

export interface WakeLockStateMachineContext {
	readonly wakeLockSentinel: Maybe<WakeLockSentinel>;
}

export type WakeLockStateMachineEvent = DoneInvokeEvent<Result<WakeLockSentinel, string>> & {
	readonly type: "done.invoke.requestWakeLock";
};

export type WakeLockStateMachineState =
	| {
			readonly value: "notAcquired";
			readonly context: WakeLockStateMachineContext & { readonly wakeLockSentinel: Nothing<WakeLockSentinel> };
	  }
	| {
			readonly value: "wakeLockSupported";
			readonly context: WakeLockStateMachineContext & { readonly wakeLockSentinel: Nothing<WakeLockSentinel> };
	  }
	| {
			readonly value: "wakeLockNotSupported";
			readonly context: WakeLockStateMachineContext & { readonly wakeLockSentinel: Nothing<WakeLockSentinel> };
	  }
	| {
			readonly value: "acquired";
			readonly context: WakeLockStateMachineContext & { readonly wakeLockSentinel: Just<WakeLockSentinel> };
	  };

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
				wakeLockSupported: {
					invoke: {
						id: "requestWakeLock",
						src: "requestWakeLock",
						onDone: {
							target: "acquired",
							actions: "setWakeLockSentinel"
						},
						onError: {}
					}
				},
				wakeLockNotSupported: {
					type: "final"
				},
				acquired: {}
			}
		},
		{
			actions: {
				setWakeLockSentinel: assign({
					wakeLockSentinel(context, event) {
						if (event.type !== "done.invoke.requestWakeLock") {
							return context.wakeLockSentinel;
						}

						return event.data.toMaybe();
					}
				})
			},
			guards: {
				isWakeLockSupported() {
					return isWakeLockSupported(navigator);
				}
			},
			services: {
				requestWakeLock() {
					return requestWakeLock(navigator);
				}
			}
		}
	) as WakeLockStateMachine;
}
