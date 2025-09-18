import { computed, ref, type ComputedRef, type Ref } from "vue";
import { isUndefined } from "@sindresorhus/is";
import { match, P } from "ts-pattern";
import { useSessionGameStore } from "../game-store/session-game-store";
import type { CurrentGameRoundSession } from "../../shared/current-game-round";

type TeamId = number;
type SelectedGamePoint = number;
type SelectedGamePoints = Record<TeamId, SelectedGamePoint>;

const minimumGamePoints = 2;

export type UseGamePoints = {
	readonly selectedGamePoints: Ref<SelectedGamePoints, SelectedGamePoints>;
	readonly isPreviousGameRoundEnabled: ComputedRef<boolean>;
	readonly isNextGameRoundEnabled: ComputedRef<boolean>;
	readonly isGamePointEnabled: (teamId: number) => boolean;
	readonly fillSelectedGamePoints: (currentGameRoundSession: CurrentGameRoundSession | undefined) => void;
	readonly clearSelectedGamePoints: () => void;
};

export function useGamePoints(): UseGamePoints {
	const sessionGameStore = useSessionGameStore();
	const hasPreviousGameRounds = ref(false);
	const selectedGamePoints = ref<SelectedGamePoints>({});

	const allSelectedGamePointsEmtpy = computed(() => {
		return Object.values(selectedGamePoints.value).every((selectedGamePoint) => {
			return selectedGamePoint < minimumGamePoints;
		});
	});

	const isPreviousGameRoundEnabled = computed(() => {
		return hasPreviousGameRounds.value && !sessionGameStore.isAudioPlaying;
	});

	const isNextGameRoundEnabled = computed(() => {
		return !allSelectedGamePointsEmtpy.value && !sessionGameStore.isAudioPlaying;
	});

	function isGamePointEnabled(teamId: number): boolean {
		if (sessionGameStore.isAudioPlaying) {
			return false;
		}

		if (allSelectedGamePointsEmtpy.value) {
			return true;
		}

		const gamePoint = selectedGamePoints.value[teamId];

		return isUndefined(gamePoint) || gamePoint >= minimumGamePoints;
	}

	function fillSelectedGamePoints(currentGameRoundSession: CurrentGameRoundSession | undefined): void {
		hasPreviousGameRounds.value = currentGameRoundSession?.hasPreviousGameRounds ?? false;

		selectedGamePoints.value = match(currentGameRoundSession)
			.returnType<SelectedGamePoints>()
			.with(undefined, () => {
				return {};
			})
			.with(P.nonNullable, (gameRoundData) => {
				return gameRoundData.teams.reduce((previousSelectedRadioButtons, team) => {
					return {
						...previousSelectedRadioButtons,
						[team.id]: -1
					};
				}, {});
			})
			.exhaustive();
	}

	function clearSelectedGamePoints(): void {
		selectedGamePoints.value = {};
	}

	return {
		selectedGamePoints,
		isPreviousGameRoundEnabled,
		isNextGameRoundEnabled,
		isGamePointEnabled,
		fillSelectedGamePoints,
		clearSelectedGamePoints
	};
}
