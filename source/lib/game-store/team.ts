import type { ReadonlyTuple } from "type-fest";

export type TeamNumber = 1 | 2;

export type Team = {
	readonly teamNumber: TeamNumber;
	readonly teamName: string;
	readonly currentGamePoints: number;
	readonly totalGamePoints: number;
	readonly isStretched: boolean;
};

export type Teams = ReadonlyTuple<Team, 2>;
