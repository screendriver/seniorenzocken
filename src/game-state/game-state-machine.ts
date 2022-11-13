import { assign, createMachine, type StateMachine, type StateSchema } from "xstate";
import type { GameWebStorage } from "../storage/game-web-storage.js";
import type { Team } from "../team/team-schema.js";
import type { ToggleRouter } from "../toggle-router/toggle-router.js";
import { shouldShowConfetti } from "./confetti.js";
import { checkIfGameWouldBeOver } from "./game-over.js";
import { areTeamsFilled, updateTeamGamePoint, type Teams } from "./teams.js";

export interface GameStateMachineContext {
	readonly teams: Teams;
	readonly canGameBeStarted: boolean;
	readonly showConfetti: boolean;
}

export type GameStateMachineEvent =
	| { readonly type: "UPDATE_TEAM_NAME"; readonly teamNumber: number; readonly teamName: string }
	| { readonly type: "START_GAME" }
	| { readonly type: "UPDATE_GAME_POINT"; readonly teamNumber: number; readonly gamePoints: number }
	| { readonly type: "START_NEW_GAME" };

export type GameStateMachineState =
	| { readonly value: "emptyTeams"; readonly context: GameStateMachineContext & { readonly canGameBeStarted: false } }
	| { readonly value: "teamsUpdating"; readonly context: GameStateMachineContext }
	| ({ readonly value: "gameRunning"; readonly context: GameStateMachineContext } & {
			readonly canGameBeStarted: true;
	  })
	| { readonly value: "gameOver"; readonly context: GameStateMachineContext };

export type GameStateMachine = StateMachine<
	GameStateMachineContext,
	StateSchema<GameStateMachineContext>,
	GameStateMachineEvent,
	GameStateMachineState
>;

export function createGameStateMachine(toggleRouter: ToggleRouter, gameWebStorage: GameWebStorage): GameStateMachine {
	return createMachine<GameStateMachineContext, GameStateMachineEvent, GameStateMachineState>(
		{
			id: "gameState",
			initial: "emptyTeams",
			predictableActionArguments: true,
			context: {
				teams: new Map(),
				canGameBeStarted: false,
				showConfetti: false
			},
			states: {
				emptyTeams: {
					on: {
						UPDATE_TEAM_NAME: {
							target: "teamsUpdating",
							actions: ["updateTeam", "saveTeamsInStorage", "setGamePointButtonsFeatureToggle"]
						}
					}
				},
				teamsUpdating: {
					on: {
						UPDATE_TEAM_NAME: {
							target: "teamsUpdating",
							actions: ["updateTeam", "saveTeamsInStorage", "setCanGameBeStarted"]
						},
						START_GAME: {
							target: "gameRunning",
							cond: "canGameBeStarted"
						}
					}
				},
				gameRunning: {
					on: {
						UPDATE_GAME_POINT: [
							{
								target: "gameOver",
								actions: "updateTeamGamePoint",
								cond: "checkIfGameWouldBeOver"
							},
							{
								target: "gameRunning",
								actions: ["updateTeamGamePoint", "shouldShowConfetti"]
							}
						]
					}
				},
				gameOver: {
					exit: "resetContext",
					on: {
						START_NEW_GAME: "emptyTeams"
					}
				}
			}
		},
		{
			actions: {
				updateTeam: assign({
					teams(context, event) {
						if (event.type !== "UPDATE_TEAM_NAME") {
							return new Map<number, Team>();
						}

						const updatedTeams = new Map(context.teams);
						updatedTeams.set(event.teamNumber, {
							teamName: event.teamName,
							gamePoints: 0,
							isStretched: false
						});

						return updatedTeams;
					}
				}),
				saveTeamsInStorage(context) {
					gameWebStorage.teams = context.teams;
				},
				setGamePointButtonsFeatureToggle(_context, event) {
					if (event.type !== "UPDATE_TEAM_NAME") {
						return;
					}

					const showGamePointButtons = event.teamName === "ratze";

					toggleRouter.setFeature("game-point-buttons", showGamePointButtons);
				},
				setCanGameBeStarted: assign({
					canGameBeStarted(context) {
						return areTeamsFilled(context.teams);
					}
				}),
				updateTeamGamePoint: assign({
					teams(context, event) {
						if (event.type !== "UPDATE_GAME_POINT") {
							return context.teams;
						}

						return updateTeamGamePoint(context.teams, event.teamNumber, event.gamePoints);
					}
				}),
				shouldShowConfetti: assign({
					showConfetti(context, event) {
						if (event.type !== "UPDATE_GAME_POINT") {
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
				})
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
