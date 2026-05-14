import type { FunctionComponent } from "react";
import { useStore } from "zustand";
import canvasConfetti from "canvas-confetti";
import { isEmptyString } from "@sindresorhus/is";
import { Navigate } from "react-router-dom";
import { useConfetti } from "../confetti/use-confetti.js";
import { useApplicationContext } from "../context/app-context.js";
import { GamePointsAudio } from "../game-points/GamePointsAudio.js";
import { GameOver } from "../game-over/GameOver.js";
import { GamePointForm } from "../game-points/GamePointForm.js";

type ShouldRedirectFromGameRouteInput = {
	readonly isGameRunning: boolean;
	readonly isGameOver: boolean;
	readonly team1Name: string;
	readonly team2Name: string;
};

export function shouldRedirectFromGameRoute(input: ShouldRedirectFromGameRouteInput): boolean {
	const { isGameRunning, isGameOver, team1Name, team2Name } = input;
	const hasMissingTeamName = isEmptyString(team1Name) || isEmptyString(team2Name);

	return hasMissingTeamName || (!isGameRunning && !isGameOver);
}

export const GameRoute: FunctionComponent = () => {
	const applicationContext = useApplicationContext();
	const { gameStore } = applicationContext;
	useConfetti(canvasConfetti);
	const isGameRunning = useStore(gameStore, (state) => {
		return state.isGameRunning;
	});
	const team1Name = useStore(gameStore, (state) => {
		return state.team1.name;
	});
	const team2Name = useStore(gameStore, (state) => {
		return state.team2.name;
	});
	const isAudioPlaying = useStore(gameStore, (state) => {
		return state.isAudioPlaying;
	});
	const isGameOver = useStore(gameStore, (state) => {
		return state.isGameOver;
	});

	if (shouldRedirectFromGameRoute({ isGameRunning, isGameOver, team1Name, team2Name })) {
		return <Navigate to="/teams" replace={true} />;
	}

	return (
		<section className="col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl bg-slate-800 sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10">
			{isAudioPlaying ? <GamePointsAudio /> : null}
			{isGameOver ? <GameOver /> : <GamePointForm />}
		</section>
	);
};
