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
import type { ToggleRouter } from "../toggle-router/toggle-router.js";
import { shouldShowConfetti } from "./confetti.js";
import { checkIfGameWouldBeOver } from "./game-over.js";

export interface GameStateMachineContext {
	readonly teamStateMachineActor: Maybe<ActorRefFrom<TeamStateMachine>>;
	readonly teams: Teams;
	readonly canGameBeStarted: boolean;
	readonly showConfetti: boolean;
}

export type GameStateMachineEvent =
	| { readonly type: "UPDATE_TEAM_NAME"; readonly teamNumber: number; readonly teamName: string }
	| TeamStateMachineSentEvent
	| { readonly type: "START_GAME" }
	| { readonly type: "UPDATE_GAME_POINT"; readonly teamNumber: number; readonly gamePoints: number }
	| { readonly type: "GAME_POINT_UPDATED"; readonly gamePoints: number; readonly teams: Teams }
	| { readonly type: "START_NEW_GAME" };

export type GameStateMachineState =
	| {
			readonly value: "gameNotRunning";
			readonly context: GameStateMachineContext & {
				readonly canGameBeStarted: false;
				readonly showConfetti: false;
			};
	  }
	| ({ readonly value: "gameRunning"; readonly context: GameStateMachineContext } & {
			readonly canGameBeStarted: true;
			readonly showConfetti: false;
	  })
	| { readonly value: "gameOver"; readonly context: GameStateMachineContext };

export type GameStateMachine = StateMachine<
	GameStateMachineContext,
	StateSchema<GameStateMachineContext>,
	GameStateMachineEvent,
	GameStateMachineState
>;

interface GameStateMachineDependencies {
	readonly toggleRouter: ToggleRouter;
	readonly teamStateMachine: TeamStateMachine;
}

export function createGameStateMachine(dependencies: GameStateMachineDependencies): GameStateMachine {
	const { toggleRouter, teamStateMachine } = dependencies;

	return createMachine<GameStateMachineContext, GameStateMachineEvent, GameStateMachineState>(
		{
			id: "gameState",
			initial: "gameNotRunning",
			predictableActionArguments: true,
			preserveActionOrder: true,
			context: {
				teamStateMachineActor: Maybe.nothing<ActorRefFrom<TeamStateMachine>>(),
				teams: new Map(),
				canGameBeStarted: false,
				showConfetti: false
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
							target: "gameRunning",
							cond: "canGameBeStarted"
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
								target: "gameOver",
								actions: "setTeams",
								cond: "checkIfGameWouldBeOver"
							},
							{
								target: "gameRunning",
								actions: ["setTeams", "shouldShowConfetti"]
							}
						]
					}
				},
				gameOver: {
					exit: ["resetContext", "resetTeamStateMachineActor"],
					on: {
						START_NEW_GAME: "gameNotRunning"
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
				setTeams: assign({
					teams(context, event) {
						if (event.type === "TEAMS_EMPTY") {
							return new Map();
						}

						if (
							event.type === "PARTIALLY_FILLED_TEAMS" ||
							event.type === "FULLY_FILLED_TEAMS" ||
							event.type === "GAME_POINT_UPDATED"
						) {
							return event.teams;
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
				setGamePointButtonsFeatureToggle(_context, event) {
					if (event.type !== "UPDATE_TEAM_NAME") {
						return;
					}

					const showGamePointButtons = event.teamName === "ratze";

					toggleRouter.setFeature("game-point-buttons", showGamePointButtons);
				},
				updateTeamGamePoint: forwardTo((context) => {
					return context.teamStateMachineActor.unwrapOr("");
				}),
				shouldShowConfetti: assign({
					showConfetti(context, event) {
						if (event.type !== "GAME_POINT_UPDATED") {
							return context.showConfetti;
						}

						return shouldShowConfetti(event.gamePoints);
					}
				}),
				resetContext: assign({
					teams(_context) {
						return new Map();
					},
					canGameBeStarted() {
						return false;
					},
					showConfetti() {
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
				checkIfGameWouldBeOver(context, event) {
					if (event.type !== "UPDATE_GAME_POINT") {
						return false;
					}

					return checkIfGameWouldBeOver(context.teams, event.teamNumber, event.gamePoints);
				}
			}
		}
	) as GameStateMachine;
}
