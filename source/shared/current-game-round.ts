export type Team = {
	readonly teamId: number;
	readonly name: string;
	readonly gamePoints: number;
};

type BaseCurrentGameRoundSession = {
	readonly teams: readonly Team[];
	readonly gamePointsPerRound: readonly [0, 2, 3, 4];
	readonly hasPreviousGameRounds: boolean;
};

export type CurrentGameRoundSessionGameNotOver = BaseCurrentGameRoundSession & {
	readonly isGameOver: false;
	readonly winnerTeam?: undefined;
};

export type CurrentGameRoundSessionGameOver = BaseCurrentGameRoundSession & {
	readonly isGameOver: true;
	readonly winnerTeam: Team;
};

export type CurrentGameRoundSession = CurrentGameRoundSessionGameNotOver | CurrentGameRoundSessionGameOver;
