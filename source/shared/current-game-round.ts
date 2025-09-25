export type Team = {
	readonly id: number;
	readonly name: string;
	readonly gamePoints: number;
};

export type CurrentGameRoundSession = {
	readonly teams: readonly Team[];
	readonly gamePointsPerRound: readonly [0, 2, 3, 4];
	readonly hasPreviousGameRounds: boolean;
};
