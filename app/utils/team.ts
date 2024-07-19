import type { ReadonlyTuple } from "type-fest";

export type TeamNumber = 1 | 2;

export type Team = {
	readonly teamNumber: TeamNumber;
	teamName: string;
	gamePoints: GamePoints;
	isStretched: boolean;
};

export type Teams = ReadonlyTuple<Ref<Team>, 2>;

export function createInitialTeam(teamNumber: TeamNumber): Team {
	return {
		teamNumber,
		teamName: "",
		gamePoints: 0,
		isStretched: false,
	};
}
