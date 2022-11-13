import { assign, createMachine, type StateMachine, type StateSchema } from "xstate";
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
				teamsEmpty: {},
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
				partiallyFilledTeams: {},
				fullyFilledTeams: {}
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
				}
			},
			guards: {
				areTeamsFullyFilled(context) {
					return areTeamsFilled(context.teams);
				}
			}
		}
	) as TeamStateMachine;
}
