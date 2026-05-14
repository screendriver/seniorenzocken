import { useEffect, useState, type FunctionComponent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "zustand";
import { useNavigate } from "react-router-dom";
import { tryOrElse } from "true-myth/task";
import { useApplicationContext } from "../context/app-context.js";
import { Button } from "../ui/button.js";

export const GameOver: FunctionComponent = () => {
	const navigate = useNavigate();
	const applicationContext = useApplicationContext();
	const { gameStore, trpc } = applicationContext;
	const queryClient = useQueryClient();
	const team1 = useStore(gameStore, (state) => {
		return state.team1;
	});
	const team2 = useStore(gameStore, (state) => {
		return state.team2;
	});
	const isAudioPlaying = useStore(gameStore, (state) => {
		return state.isAudioPlaying;
	});
	const [wonText, setWonText] = useState("");

	useEffect(() => {
		const determineWinnerTeam = async (): Promise<void> => {
			const winnerTeamResult = await tryOrElse(
				(error: unknown) => {
					return new Error("Could not determine winner team", { cause: error });
				},
				async () => {
					return queryClient.fetchQuery(trpc.game.determineWinnerTeam.queryOptions({ team1, team2 }));
				}
			);

			setWonText(
				winnerTeamResult.mapOr("Gewonnen hat: ???", (winnerTeam) => {
					return `Gewonnen hat: Team "${winnerTeam.name}"`;
				})
			);
		};
		void determineWinnerTeam();
	}, [queryClient, team1, team2, trpc.game.determineWinnerTeam]);

	return (
		<section className="col-span-full my-8 grid grid-cols-subgrid grid-rows-3 gap-2 lg:col-start-2 lg:col-end-6">
			<h1 className="col-span-full place-self-center">{wonText}</h1>
			<Button
				type="button"
				className="col-span-full mx-10 md:col-start-2 md:col-end-4 md:mx-0"
				onClick={() => {
					void navigate("/teams", { replace: true });
				}}
			>
				Neues Spiel
			</Button>
			<Button
				disabled={isAudioPlaying}
				type="button"
				className="col-span-full mx-10 md:col-start-2 md:col-end-4 md:mx-0"
				onClick={() => {
					gameStore.getState().setIsAudioPlaying(true);
				}}
			>
				Punktestand vorlesen
			</Button>
		</section>
	);
};
