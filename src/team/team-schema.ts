export interface Team {
	readonly teamName: string;
	readonly gamePoints: number;
	readonly isStretched: boolean;
}

export type Teams = readonly [Team, Team];

export type TeamNumber = 0 | 1;
