import type { FunctionComponent } from "react";
import { useStore } from "zustand";
import { useApplicationContext } from "../context/app-context.js";
import { Button } from "../ui/button.js";
import { ButtonGroup } from "../ui/button-group.js";
import { GamePoint } from "./GamePoint.js";

export const GamePointForm: FunctionComponent = () => {
	const applicationContext = useApplicationContext();
	const { gameStore } = applicationContext;
	const team1 = useStore(gameStore, (state) => {
		return state.team1;
	});
	const team2 = useStore(gameStore, (state) => {
		return state.team2;
	});
	const isPreviousGameRoundEnabled = useStore(gameStore, (state) => {
		return state.isPreviousGameRoundEnabled();
	});
	const isNextGameRoundEnabled = useStore(gameStore, (state) => {
		return state.isNextGameRoundEnabled();
	});

	return (
		<form className="col-span-full mx-4 my-8 grid grid-cols-subgrid lg:col-start-2 lg:col-end-6">
			<fieldset className="col-span-full flex flex-col gap-5">
				<GamePoint
					gamePoint={team1.currentRoundGamePoints}
					onChange={(gamePoint) => {
						gameStore.setState((state) => {
							return {
								team1: { ...state.team1, currentRoundGamePoints: gamePoint }
							};
						});
					}}
					team={team1}
					enabled={gameStore.getState().isGamePointEnabled(team1.currentRoundGamePoints)}
				/>
				<GamePoint
					gamePoint={team2.currentRoundGamePoints}
					onChange={(gamePoint) => {
						gameStore.setState((state) => {
							return {
								team2: { ...state.team2, currentRoundGamePoints: gamePoint }
							};
						});
					}}
					team={team2}
					enabled={gameStore.getState().isGamePointEnabled(team2.currentRoundGamePoints)}
				/>
				<ButtonGroup className="self-center" aria-label="Rundensteuerung">
					<Button
						disabled={!isPreviousGameRoundEnabled}
						type="button"
						className="min-w-36 disabled:bg-slate-700 disabled:text-slate-500"
						onClick={() => {
							gameStore.getState().previousGameRound();
						}}
					>
						Runde zurück
					</Button>
					<Button
						disabled={!isNextGameRoundEnabled}
						type="button"
						className="min-w-36 disabled:bg-slate-700 disabled:text-slate-500"
						onClick={() => {
							gameStore.getState().nextGameRound();
						}}
					>
						Nächste Runde
					</Button>
				</ButtonGroup>
			</fieldset>
		</form>
	);
};
