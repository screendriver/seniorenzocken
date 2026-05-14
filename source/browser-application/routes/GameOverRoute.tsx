import type { FunctionComponent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import type { CurrentGameRoundSession, CurrentGameRoundSessionGameOver } from "../../shared/current-game-round.js";
import { AlertErrorMessage } from "../alert/AlertErrorMessage.js";
import { useApplicationContext } from "../context/app-context.js";
import { Button } from "../ui/button.js";

function isCurrentGameRoundGameOver(
	currentGameRound: CurrentGameRoundSession | undefined
): currentGameRound is CurrentGameRoundSessionGameOver {
	return currentGameRound?.isGameOver === true;
}

export const GameOverRoute: FunctionComponent = () => {
	const applicationContext = useApplicationContext();
	const { trpc } = applicationContext;
	const navigate = useNavigate();
	const currentGameRoundQuery = useQuery(trpc.session.currentGameRound.queryOptions());
	const currentGameRound = currentGameRoundQuery.data;

	if (currentGameRoundQuery.fetchStatus === "fetching" && currentGameRound === undefined) {
		return (
			<section className="col-span-full flex items-center justify-center py-16">
				<Loader2 className="size-8 animate-spin text-slate-300" />
			</section>
		);
	}

	if (currentGameRoundQuery.isError) {
		return (
			<section className="col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl bg-slate-800 py-8 text-slate-100 sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10">
				<div className="col-span-full mx-6 grid gap-4 lg:col-start-2 lg:col-end-6">
					<AlertErrorMessage errorMessage="Spielende konnte nicht geladen werden" />
					<div className="flex justify-center gap-2">
						<Button
							type="button"
							onClick={() => {
								void currentGameRoundQuery.refetch();
							}}
						>
							Erneut versuchen
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={() => {
								void navigate("/teams-selection", { replace: true });
							}}
						>
							Zur Auswahl
						</Button>
					</div>
				</div>
			</section>
		);
	}

	if (currentGameRound === undefined) {
		return null;
	}

	if (!isCurrentGameRoundGameOver(currentGameRound)) {
		return <Navigate to="/session-game" replace={true} />;
	}

	const wonText = `Gewonnen hat: ${currentGameRound.winnerTeam.name}`;

	return (
		<section className="col-span-4 rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-md md:col-start-3 lg:col-start-5">
			<h1 className="text-center">{wonText}</h1>
			<div className="mt-4 flex justify-center gap-2">
				<Button
					type="button"
					variant="secondary"
					onClick={() => {
						void navigate("/teams-selection", { replace: true });
					}}
				>
					Neues Spiel
				</Button>
			</div>
		</section>
	);
};
