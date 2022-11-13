import { assign, createMachine, sendParent, type EventObject, type StateMachine, type StateSchema } from "xstate";
import type { GameWebStorage } from "../storage/game-web-storage.js";
import type { Team, Teams } from "./team-schema.js";
import { areTeamsFilled } from "./teams-filled.js";

export interface TeamStateMachineContext {
	readonly teams: Teams;
}

export type TeamStateMachineEvent = {
	readonly type: "UPDATE_TEAM_NAME";
	readonly teamNumber: number;
	readonly teamName: string;
};

export const possibleSentEventNames = ["TEAMS_EMPTY", "PARTIALLY_FILLED_TEAMS", "FULLY_FILLED_TEAMS"] as const;

export type PossibleSentEventNames = typeof possibleSentEventNames[number];

interface TeamStateMachineSentEventObject<T extends PossibleSentEventNames> extends EventObject {
	readonly type: T;
}

export type TeamStateMachineSentEvent =
	| TeamStateMachineSentEventObject<"TEAMS_EMPTY">
	| (TeamStateMachineSentEventObject<"PARTIALLY_FILLED_TEAMS"> & { readonly teams: Teams })
	| (TeamStateMachineSentEventObject<"FULLY_FILLED_TEAMS"> & { readonly teams: Teams });

interface StateWithContext<StateName extends string> {
	readonly context: TeamStateMachineContext;
	readonly value: StateName;
}

export type TeamStateMachineState =
	| StateWithContext<"teamsEmpty">
	| StateWithContext<"teamNameUpdating">
	| StateWithContext<"partiallyFilledTeams">
	| StateWithContext<"fullyFilledTeams">;

export type TeamStateMachine = StateMachine<
	TeamStateMachineContext,
	StateSchema<TeamStateMachineContext>,
	TeamStateMachineEvent,
	TeamStateMachineState
>;

export function createTeamStateMachine(gameWebStorage: GameWebStorage): TeamStateMachine {
	return createMachine<TeamStateMachineContext, TeamStateMachineEvent, TeamStateMachineState>(
		{
			id: "teamState",
			initial: "teamsEmpty",
			predictableActionArguments: true,
			preserveActionOrder: true,
			context: {
				teams: new Map()
			},
			on: {
				UPDATE_TEAM_NAME: [
					{
						target: "teamNameUpdating",
						actions: ["updateTeamName", "saveTeamsInStorage"]
					}
				]
			},
			states: {
				teamsEmpty: {
					entry: "sendTeamsEmptyToParent"
				},
				teamNameUpdating: {
					always: [
						{
							target: "fullyFilledTeams",
							cond: "areTeamsFullyFilled"
						},
						{
							target: "partiallyFilledTeams"
						}
					]
				},
				partiallyFilledTeams: {
					entry: "sendPartiallyFilledTeamsToParent"
				},
				fullyFilledTeams: {
					entry: "sendFullyFilledTeamsToParent"
				}
			}
		},
		{
			actions: {
				updateTeamName: assign({
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
				sendTeamsEmptyToParent: sendParent<
					TeamStateMachineContext,
					TeamStateMachineEvent,
					TeamStateMachineSentEvent
				>("TEAMS_EMPTY"),
				sendPartiallyFilledTeamsToParent: sendParent<
					TeamStateMachineContext,
					TeamStateMachineEvent,
					TeamStateMachineSentEvent
				>((context) => {
					return {
						type: "PARTIALLY_FILLED_TEAMS",
						teams: context.teams
					};
				}),
				sendFullyFilledTeamsToParent: sendParent<
					TeamStateMachineContext,
					TeamStateMachineEvent,
					TeamStateMachineSentEvent
				>((context) => {
					return {
						type: "FULLY_FILLED_TEAMS",
						teams: context.teams
					};
				})
			},
			guards: {
				areTeamsFullyFilled(context) {
					return areTeamsFilled(context.teams);
				}
			}
		}
	) as TeamStateMachine;
}
