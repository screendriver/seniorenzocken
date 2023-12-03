import type { Readable } from "svelte/store";
import { writable, get } from "svelte/store";
import { Stack } from "js-sdsl";
import Maybe from "true-myth/maybe";
import type { TeamNumber, Team, Teams } from "./team.js";
import { checkIfGameWouldBeOver } from "../game-over/game-over.js";
import { shouldShowConfetti } from "../confetti/confetti.js";
import { settingsStore } from "../settings/settings-store.js";
import { cloneGameRounds } from "./game-rounds.js";

export type GameStoreState = {
	readonly gameRunning: boolean;
	readonly teams: Teams;
	readonly gameRounds: Stack<Teams>;
	readonly audioPlaying: boolean;
	readonly shouldShowConfetti: boolean;
	readonly isGameOver: boolean;
};

export type GameStore = Readable<GameStoreState> & {
	updateTeamName(teamToUpdate: Team, teamName: string): void;
	startGame(): void;
	setCurrentGamePoints(teamToUpdate: Team, gamePointsToAdd: number): void;
	nextGameRound(): void;
	previousGameRound(): void;
	gamePointsAudioEnded(): void;
	showConfetti(): void;
	hideConfetti(): void;
	startNewGame(): void;
};

function createEmptyTeam(teamNumber: TeamNumber): Team {
	return {
		teamNumber,
		teamName: "",
		currentGamePoints: 0,
		totalGamePoints: 0,
		isStretched: false,
	};
}

function createInitialState(): GameStoreState {
	const initialTeams: Teams = [createEmptyTeam(1), createEmptyTeam(2)];

	return {
		gameRunning: false,
		teams: initialTeams,
		gameRounds: new Stack(),
		audioPlaying: false,
		shouldShowConfetti: false,
		isGameOver: false,
	};
}

type UpdateTeamOptions<TKey extends keyof Team> = {
	readonly teams: Teams;
	readonly teamToUpdate: Team;
	readonly propertyName: TKey;
	readonly propertyValue: Team[TKey];
};

function updateTeam<TKey extends keyof Team>(options: UpdateTeamOptions<TKey>): Teams {
	const { teams, teamToUpdate, propertyName, propertyValue } = options;

	return teams.map((team) => {
		if (team === teamToUpdate) {
			return { ...team, [propertyName]: propertyValue };
		}

		return team;
	}) as unknown as Teams;
}

export function createGameStore(): GameStore {
	const initialState = createInitialState();

	const { subscribe, update, set } = writable(initialState);

	return {
		subscribe,
		updateTeamName(teamToUpdate, teamName) {
			update((state) => {
				const teams = updateTeam({
					teams: state.teams,
					teamToUpdate,
					propertyName: "teamName",
					propertyValue: teamName,
				});

				return { ...state, teams };
			});
		},
		startGame() {
			update((state) => {
				return { ...state, gameRunning: true };
			});
		},
		setCurrentGamePoints(teamToUpdate, gamePointsToAdd) {
			update((state) => {
				const teams = updateTeam({
					teams: state.teams,
					teamToUpdate,
					propertyName: "currentGamePoints",
					propertyValue: gamePointsToAdd,
				});

				return { ...state, teams };
			});
		},
		nextGameRound() {
			update((state) => {
				let teams = state.teams.map((team) => {
					const totalGamePoints = team.totalGamePoints + team.currentGamePoints;
					const isStretched = totalGamePoints >= 12;

					return { ...team, totalGamePoints, isStretched };
				}) as unknown as Teams;

				const showConfetti = shouldShowConfetti(teams);
				const audioPlaying = get(settingsStore).audioEnabled;
				const isGameOver = checkIfGameWouldBeOver(teams);

				teams = teams.map((team) => {
					return { ...team, currentGamePoints: 0 };
				}) as unknown as Teams;

				const clonedGameRounds = cloneGameRounds(state.gameRounds);
				clonedGameRounds.push(teams);

				return {
					...state,
					teams,
					gameRounds: clonedGameRounds,
					shouldShowConfetti: showConfetti,
					isGameOver,
					gameRunning: !isGameOver,
					audioPlaying,
				};
			});
		},
		previousGameRound() {
			update((state) => {
				const clonedGameRounds = cloneGameRounds(state.gameRounds);
				const currentGameRound = Maybe.of(clonedGameRounds.pop());
				const previousGameRound = Maybe.of(clonedGameRounds.top());

				return previousGameRound.match({
					Just(teams) {
						return { ...state, teams, gameRounds: clonedGameRounds };
					},
					Nothing() {
						return currentGameRound.mapOr(state, (teams) => {
							const teamsWithoutTotalGamePoints = teams.map((team) => {
								return { ...team, totalGamePoints: 0 };
							}) as unknown as Teams;

							return { ...state, teams: teamsWithoutTotalGamePoints };
						});
					},
				});
			});
		},
		gamePointsAudioEnded() {
			update((state) => {
				return { ...state, audioPlaying: false };
			});
		},
		showConfetti() {
			update((state) => {
				return { ...state, shouldShowConfetti: true };
			});
		},
		hideConfetti() {
			update((state) => {
				return { ...state, shouldShowConfetti: false };
			});
		},
		startNewGame() {
			set(createInitialState());
		},
	};
}

export const gameStore = createGameStore();
