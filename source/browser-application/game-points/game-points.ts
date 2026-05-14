import { useCallback, useMemo, useState } from "react";
import { isUndefined } from "@sindresorhus/is";
import { match, P } from "ts-pattern";
import { type Maybe, find as findMaybe } from "true-myth/maybe";
import type { CurrentGameRoundSession } from "../../shared/current-game-round.js";

type SelectedGamePoints = Record<number, number>;

type SelectedGamePoint = {
	readonly teamId: number;
	readonly selectedGamePoint: number;
};

type UseGamePointsReturn = {
	readonly selectedGamePoints: SelectedGamePoints;
	readonly setSelectedGamePoints: (selectedGamePoints: SelectedGamePoints) => void;
	readonly isPreviousGameRoundEnabled: boolean;
	readonly isNextGameRoundEnabled: boolean;
	readonly selectedGamePoint: Maybe<SelectedGamePoint>;
	readonly isGameOver: boolean;
	readonly isGamePointEnabled: (teamId: number) => boolean;
	readonly fillSelectedGamePoints: (currentGameRoundSession: CurrentGameRoundSession | undefined) => void;
	readonly clearSelectedGamePoints: () => void;
};

const minimumGamePoints = 2;

export function useGamePoints(): UseGamePointsReturn {
	const [hasPreviousGameRounds, setHasPreviousGameRounds] = useState(false);
	const [selectedGamePoints, setSelectedGamePoints] = useState<SelectedGamePoints>({});
	const [isGameOver, setIsGameOver] = useState(false);

	const allSelectedGamePointsEmpty = useMemo(() => {
		return Object.values(selectedGamePoints).every((selectedGamePoint) => {
			return selectedGamePoint < minimumGamePoints;
		});
	}, [selectedGamePoints]);

	const isPreviousGameRoundEnabled = hasPreviousGameRounds;
	const isNextGameRoundEnabled = !allSelectedGamePointsEmpty;

	const selectedGamePoint: Maybe<SelectedGamePoint> = useMemo(() => {
		return findMaybe((currentSelectedGamePoint) => {
			return currentSelectedGamePoint[1] > 0;
		}, Object.entries(selectedGamePoints)).map((foundSelectedGamePoint) => {
			return {
				teamId: Number.parseInt(foundSelectedGamePoint[0], 10),
				selectedGamePoint: foundSelectedGamePoint[1]
			};
		});
	}, [selectedGamePoints]);

	const isGamePointEnabled = useCallback(
		(teamId: number): boolean => {
			if (allSelectedGamePointsEmpty) {
				return true;
			}
			const gamePoint = selectedGamePoints[teamId];
			return isUndefined(gamePoint) || gamePoint >= minimumGamePoints;
		},
		[allSelectedGamePointsEmpty, selectedGamePoints]
	);

	const fillSelectedGamePoints = useCallback((currentGameRoundSession: CurrentGameRoundSession | undefined): void => {
		setHasPreviousGameRounds(currentGameRoundSession?.hasPreviousGameRounds ?? false);
		setSelectedGamePoints(
			match(currentGameRoundSession)
				.returnType<SelectedGamePoints>()
				.with(undefined, () => {
					return {};
				})
				.with(P.nonNullable, (gameRoundData) => {
					return gameRoundData.teams.reduce<SelectedGamePoints>((previousSelectedRadioButtons, team) => {
						return { ...previousSelectedRadioButtons, [team.teamId]: -1 };
					}, {});
				})
				.exhaustive()
		);
		setIsGameOver(currentGameRoundSession?.isGameOver ?? false);
	}, []);

	const clearSelectedGamePoints = useCallback((): void => {
		setSelectedGamePoints({});
	}, []);

	return {
		selectedGamePoints,
		setSelectedGamePoints,
		isPreviousGameRoundEnabled,
		isNextGameRoundEnabled,
		selectedGamePoint,
		isGameOver,
		isGamePointEnabled,
		fillSelectedGamePoints,
		clearSelectedGamePoints
	};
}
