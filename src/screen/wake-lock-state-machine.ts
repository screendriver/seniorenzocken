import { assign, createMachine, type DoneInvokeEvent, type StateMachine, type StateSchema } from "xstate";
import Maybe, { type Just, type Nothing } from "true-myth/maybe";
import type Result from "true-myth/result";
import { isWakeLockSupported, requestWakeLock } from "./wake-lock.js";

export interface WakeLockStateMachineContext {
	readonly wakeLockSentinel: Maybe<WakeLockSentinel>;
}

export type WakeLockStateMachineEvent =
	| (DoneInvokeEvent<Result<WakeLockSentinel, string>> & {
			readonly type: "done.invoke.requestWakeLock";
	  })
	| { readonly type: "WAKE_LOCK_RELEASED" }
	| { readonly type: "REACQUIRE_WAKE_LOCK" };

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
	  }
	| {
			readonly value: "acquisitionError";
			readonly context: WakeLockStateMachineContext & { readonly wakeLockSentinel: Nothing<WakeLockSentinel> };
	  }
	| {
			readonly value: "wakeLockReleased";
			readonly context: WakeLockStateMachineContext & { readonly wakeLockSentinel: Nothing<WakeLockSentinel> };
	  };

export type WakeLockStateMachine = StateMachine<
	WakeLockStateMachineContext,
	StateSchema<WakeLockStateMachineContext>,
	WakeLockStateMachineEvent,
	WakeLockStateMachineState
>;

export function createWakeLockStateMachine(navigator: Navigator, document: Document): WakeLockStateMachine {
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
						onDone: [
							{
								cond: "wasRequestWakeLockSuccessful",
								actions: "setWakeLockSentinel",
								target: "acquired"
							},
							{
								target: "acquisitionError"
							}
						]
					}
				},
				wakeLockNotSupported: {
					type: "final"
				},
				acquired: {
					invoke: {
						id: "releaseListener",
						src(context) {
							return (senderCallback) => {
								const { wakeLockSentinel } = context;

								if (wakeLockSentinel.isNothing) {
									throw new Error("No wake lock set");
								}

								function sendReleasedEvent(): void {
									senderCallback("WAKE_LOCK_RELEASED");
								}

								wakeLockSentinel.value.addEventListener("release", sendReleasedEvent);

								return () => {
									wakeLockSentinel.value.removeEventListener("release", sendReleasedEvent);
								};
							};
						}
					},
					on: {
						WAKE_LOCK_RELEASED: {
							actions: "resetWakeLock",
							target: "wakeLockReleased"
						}
					}
				},
				acquisitionError: {},
				wakeLockReleased: {
					invoke: {
						id: "reacquireWakeLock",
						src() {
							return (senderCallback) => {
								function sendReacquireEvent(): void {
									if (document.visibilityState === "visible") {
										senderCallback("REACQUIRE_WAKE_LOCK");
									}
								}

								document.addEventListener("visibilitychange", sendReacquireEvent);

								return () => {
									document.removeEventListener("visibilitychange", sendReacquireEvent);
								};
							};
						}
					},
					on: {
						REACQUIRE_WAKE_LOCK: "wakeLockSupported"
					}
				}
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
				}),
				resetWakeLock: assign({
					wakeLockSentinel(_context) {
						return Maybe.nothing();
					}
				})
			},
			guards: {
				isWakeLockSupported() {
					return isWakeLockSupported(navigator);
				},
				wasRequestWakeLockSuccessful(_context, event) {
					if (event.type !== "done.invoke.requestWakeLock") {
						return false;
					}

					return event.data.isOk;
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
