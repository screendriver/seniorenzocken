import { Fragment, useEffect, useRef, type FormEvent, type FunctionComponent } from "react";
import { useStore } from "zustand";
import { isEmptyString } from "@sindresorhus/is";
import { useNavigate } from "react-router-dom";
import { useApplicationContext } from "../context/app-context.js";
import { RandomFunAudio, type RandomFunAudioHandle } from "../random-fun-audio/RandomFunAudio.js";
import { Input } from "../ui/input.js";
import { Button } from "../ui/button.js";
import { Alert } from "../ui/alert.js";

export const TeamsRoute: FunctionComponent = () => {
	const randomFunAudioReference = useRef<RandomFunAudioHandle>(null);
	const navigate = useNavigate();
	const applicationContext = useApplicationContext();
	const { gameStore } = applicationContext;
	const hasError = useStore(gameStore, (state) => {
		return state.hasError;
	});
	const team1 = useStore(gameStore, (state) => {
		return state.team1;
	});
	const team2 = useStore(gameStore, (state) => {
		return state.team2;
	});

	useEffect(() => {
		gameStore.getState().newGame();
	}, [gameStore]);

	const isSubmitDisabled = hasError || isEmptyString(team1.name) || isEmptyString(team2.name);

	function handleSubmit(formSubmissionEvent: FormEvent<HTMLFormElement>): void {
		formSubmissionEvent.preventDefault();
		randomFunAudioReference.current?.playEmptyAudio();
		const startGame = async (): Promise<void> => {
			const startGameResult = await gameStore.getState().startGame();
			if (startGameResult.isOk) {
				await navigate("/game", { replace: true });
			}
		};

		void startGame();
	}

	return (
		<Fragment>
			<RandomFunAudio ref={randomFunAudioReference} />
			<section className="col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl bg-slate-800 text-slate-100 sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10">
				<form
					className="col-span-full mx-6 my-8 grid grid-flow-col grid-cols-subgrid grid-rows-3 items-center gap-2 lg:col-start-2 lg:col-end-6"
					onSubmit={handleSubmit}
				>
					{hasError ? (
						<Alert
							variant="destructive"
							className="col-span-full mb-2 border-red-600 bg-red-950/80 text-red-100"
						>
							<span>Es ist ein unbekannter Fehler aufgetreten.</span>
						</Alert>
					) : null}
					<label className="col-span-full grid w-full gap-2">
						<span className="text-slate-100">Team 1</span>
						<Input
							id="team1-name"
							type="text"
							placeholder="Name"
							value={team1.name}
							onChange={(changeEvent) => {
								gameStore.getState().setTeam1Name(changeEvent.currentTarget.value);
							}}
						/>
					</label>
					<label className="col-span-full grid w-full gap-2">
						<span className="text-slate-100">Team 2</span>
						<Input
							id="team2-name"
							type="text"
							placeholder="Name"
							value={team2.name}
							onChange={(changeEvent) => {
								gameStore.getState().setTeam2Name(changeEvent.currentTarget.value);
							}}
						/>
					</label>
					<div className="col-span-full justify-self-center">
						<Button disabled={isSubmitDisabled} type="submit">
							Spiel starten
						</Button>
					</div>
				</form>
			</section>
		</Fragment>
	);
};
