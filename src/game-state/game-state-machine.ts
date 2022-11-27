import {
	assign,
	createMachine,
	spawn,
	type StateMachine,
	type StateSchema,
	type ActorRefFrom,
	send,
	forwardTo
} from "xstate";
import Maybe from "true-myth/maybe";
import type { Teams } from "../team/team-schema.js";
import type { TeamStateMachine, TeamStateMachineSentEvent } from "../team/team-state-machine.js";
import { shouldShowConfetti } from "./confetti.js";
import { checkIfGameWouldBeOver } from "./game-over.js";

export interface GameStateMachineContext {
	readonly teamStateMachineActor: Maybe<ActorRefFrom<TeamStateMachine>>;
	readonly teams: Maybe<Teams>;
	readonly canGameBeStarted: boolean;
}

export type GameStateMachineEvent =
	| { readonly type: "UPDATE_TEAM_NAME"; readonly teamNumber: number; readonly teamName: string }
	| TeamStateMachineSentEvent
	| { readonly type: "START_GAME" }
	| { readonly type: "UPDATE_GAME_POINT"; readonly teamNumber: number; readonly gamePoints: number }
	| {
			readonly type: "GAME_POINT_UPDATED";
			readonly teamNumber: number;
			readonly teams: Teams;
			readonly gamePoints: number;
	  }
	| { readonly type: "AUDIO_ENDED" }
	| { readonly type: "CONFETTI_HIDDEN" }
	| { readonly type: "START_NEW_GAME" }
	| { readonly type: "REPLAY_AUDIO" };

export type GameStateMachineState =
	| {
			readonly value: "gameNotRunning";
			readonly context: GameStateMachineContext & {
				readonly canGameBeStarted: false;
			};
	  }
	| ({
			readonly value:
				| "gameRunning"
				| "gameRunning.audio"
				| "gameRunning.audio.notPlaying"
				| "gameRunning.audio.playing"
				| "gameRunning.confetti"
				| "gameRunning.confetti.hidden"
				| "gameRunning.confetti.visible";
			readonly context: GameStateMachineContext;
	  } & {
			readonly canGameBeStarted: true;
	  })
	| {
			readonly value: "gameOver" | "gameOver.audioPlaying" | "gameOver.audioNotPlaying";
			readonly context: GameStateMachineContext;
	  };

export type GameStateMachine = StateMachine<
	GameStateMachineContext,
	StateSchema<GameStateMachineContext>,
	GameStateMachineEvent,
	GameStateMachineState
>;

interface GameStateMachineDependencies {
	readonly teamStateMachine: TeamStateMachine;
}

export function createGameStateMachine(dependencies: GameStateMachineDependencies): GameStateMachine {
	const { teamStateMachine } = dependencies;

	return createMachine<GameStateMachineContext, GameStateMachineEvent, GameStateMachineState>(
		{
			id: "gameState",
			initial: "gameNotRunning",
			predictableActionArguments: true,
			preserveActionOrder: true,
			type: "compound",
			context: {
				teamStateMachineActor: Maybe.nothing<ActorRefFrom<TeamStateMachine>>(),
				teams: Maybe.nothing(),
				canGameBeStarted: false
			},
			states: {
				gameNotRunning: {
					entry: "spawnTeamStateMachine",
					on: {
						UPDATE_TEAM_NAME: {
							actions: "updateTeamName"
						},
						TEAMS_EMPTY: {
							actions: ["setTeams", "setGameCannotBeStarted"]
						},
						PARTIALLY_FILLED_TEAMS: {
							actions: ["setTeams", "setGameCannotBeStarted"]
						},
						FULLY_FILLED_TEAMS: {
							actions: ["setTeams", "setGameCanBeStarted"]
						},
						START_GAME: {
							cond: "canGameBeStarted",
							target: "gameRunning"
						}
					}
				},
				gameRunning: {
					on: {
						UPDATE_GAME_POINT: {
							actions: "updateTeamGamePoint"
						},
						GAME_POINT_UPDATED: [
							{
								cond: "checkIfGameWouldBeOver",
								target: "#gameState.gameOver",
								actions: "setTeams"
							},
							{
								actions: "setTeams"
							}
						]
					},
					type: "parallel",
					states: {
						audio: {
							type: "compound",
							initial: "notPlaying",
							states: {
								notPlaying: {
									on: {
										GAME_POINT_UPDATED: {
											target: "playing",
											actions: "resendGamePointUpdatedEvent"
										}
									}
								},
								playing: {
									on: {
										AUDIO_ENDED: {
											target: "notPlaying"
										}
									}
								}
							}
						},
						confetti: {
							type: "compound",
							initial: "hidden",
							states: {
								hidden: {
									on: {
										GAME_POINT_UPDATED: {
											target: "visible",
											cond: "shouldShowConfetti"
										}
									}
								},
								visible: {
									on: {
										CONFETTI_HIDDEN: {
											target: "hidden"
										}
									}
								}
							}
						}
					}
				},
				gameOver: {
					exit: ["resetContext", "resetTeamStateMachineActor"],
					initial: "audioPlaying",
					type: "compound",
					states: {
						audioPlaying: {
							on: {
								AUDIO_ENDED: "audioNotPlaying"
							}
						},
						audioNotPlaying: {
							on: {
								START_NEW_GAME: "#gameState.gameNotRunning",
								REPLAY_AUDIO: "audioPlaying"
							}
						}
					}
				}
			}
		},
		{
			actions: {
				spawnTeamStateMachine: assign({
					teamStateMachineActor(_context) {
						const actorReference = spawn(teamStateMachine);

						return Maybe.just(actorReference);
					}
				}),
				updateTeamName: forwardTo((context) => {
					return context.teamStateMachineActor.unwrapOr("");
				}),
				resendGamePointUpdatedEvent: send((_context, event) => {
					return event;
				}),
				setTeams: assign({
					teams(context, event) {
						if (event.type === "TEAMS_EMPTY") {
							return Maybe.nothing();
						}

						if (
							event.type === "PARTIALLY_FILLED_TEAMS" ||
							event.type === "FULLY_FILLED_TEAMS" ||
							event.type === "GAME_POINT_UPDATED"
						) {
							return Maybe.just(event.teams);
						}

						return context.teams;
					}
				}),
				setGameCannotBeStarted: assign({
					canGameBeStarted(_context) {
						return false;
					}
				}),
				setGameCanBeStarted: assign({
					canGameBeStarted(_context) {
						return true;
					}
				}),
				updateTeamGamePoint: forwardTo((context) => {
					return context.teamStateMachineActor.unwrapOr("");
				}),
				resetContext: assign({
					teams(_context) {
						return Maybe.nothing();
					},
					canGameBeStarted() {
						return false;
					}
				}),
				resetTeamStateMachineActor: send(
					{ type: "RESET" },
					{
						to(context) {
							return context.teamStateMachineActor.unwrapOr("");
						}
					}
				)
			},
			guards: {
				canGameBeStarted(context) {
					return context.canGameBeStarted;
				},
				shouldShowConfetti(_context, event) {
					if (event.type !== "GAME_POINT_UPDATED") {
						return false;
					}

					return shouldShowConfetti(event.gamePoints);
				},
				checkIfGameWouldBeOver(_context, event) {
					if (event.type !== "GAME_POINT_UPDATED") {
						return false;
					}

					return checkIfGameWouldBeOver(event.teams);
				}
			}
		}
	) as GameStateMachine;
}
