import { useState, type FunctionComponent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertErrorMessage } from "../alert/AlertErrorMessage.js";
import { useApplicationContext } from "../context/app-context.js";
import { SelectPlayer } from "../teams-selection/SelectPlayer.js";
import { areSelectedPlayerIdsValid } from "../teams-selection/selected-player-ids.js";
import { Button } from "../ui/button.js";

type SubmitButtonEnabledInput = {
	readonly selectedPlayerIds: readonly [number, number, number, number];
	readonly isStartGamePending: boolean;
};

function isSubmitButtonEnabled(input: SubmitButtonEnabledInput): boolean {
	const { selectedPlayerIds, isStartGamePending } = input;

	return areSelectedPlayerIdsValid(selectedPlayerIds) && !isStartGamePending;
}

export const TeamsSelectionRoute: FunctionComponent = () => {
	const navigate = useNavigate();
	const applicationContext = useApplicationContext();
	const { trpc } = applicationContext;
	const [selectedPlayer1Id, setSelectedPlayer1Id] = useState(-1);
	const [selectedPlayer2Id, setSelectedPlayer2Id] = useState(-1);
	const [selectedPlayer3Id, setSelectedPlayer3Id] = useState(-1);
	const [selectedPlayer4Id, setSelectedPlayer4Id] = useState(-1);

	const playersQuery = useQuery(trpc.players.queryOptions());

	const startGameMutation = useMutation(
		trpc.session.startGame.mutationOptions({
			async onSuccess() {
				return navigate("/session-game", { replace: true });
			}
		})
	);

	const submitButtonEnabled = isSubmitButtonEnabled({
		selectedPlayerIds: [selectedPlayer1Id, selectedPlayer2Id, selectedPlayer3Id, selectedPlayer4Id],
		isStartGamePending: startGameMutation.isPending
	});

	if (playersQuery.fetchStatus === "fetching" && playersQuery.data === undefined) {
		return (
			<section className="col-span-full flex items-center justify-center py-16">
				<Loader2 className="size-8 animate-spin text-slate-300" />
			</section>
		);
	}

	if (playersQuery.isError) {
		return (
			<section className="col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl bg-slate-800 py-8 text-slate-100 sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10">
				<div className="col-span-full mx-6 grid gap-4 lg:col-start-2 lg:col-end-6">
					<AlertErrorMessage errorMessage="Spieler konnten nicht geladen werden" />
					<div className="flex justify-center">
						<Button
							type="button"
							onClick={() => {
								void playersQuery.refetch();
							}}
						>
							Erneut versuchen
						</Button>
					</div>
				</div>
			</section>
		);
	}

	if (playersQuery.data === undefined) {
		return null;
	}

	if (playersQuery.data.length === 0) {
		return (
			<section className="col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl bg-slate-800 py-8 text-slate-100 sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10">
				<div className="col-span-full mx-6 grid gap-4 lg:col-start-2 lg:col-end-6">
					<AlertErrorMessage errorMessage="Keine Spieler gefunden" />
				</div>
			</section>
		);
	}

	return (
		<form
			onSubmit={(formSubmissionEvent) => {
				formSubmissionEvent.preventDefault();
				startGameMutation.mutate({
					team1Player1Id: selectedPlayer1Id,
					team1Player2Id: selectedPlayer2Id,
					team2Player1Id: selectedPlayer3Id,
					team2Player2Id: selectedPlayer4Id
				});
			}}
			className="col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl bg-slate-800 py-8 text-slate-100 sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10"
		>
			{startGameMutation.isError ? (
				<div className="col-span-full mx-6 mb-4 lg:col-start-2 lg:col-end-6">
					<AlertErrorMessage errorMessage="Spiel konnte nicht gestartet werden" />
				</div>
			) : null}
			<fieldset className="col-span-full mx-6 grid items-center gap-2 lg:col-start-2 lg:col-end-6">
				<legend className="mb-2 text-sm font-medium text-slate-100">Team 1</legend>
				<SelectPlayer
					playerNumber={1}
					players={playersQuery.data}
					selectedPlayerId={selectedPlayer1Id}
					onChange={setSelectedPlayer1Id}
				/>
				<SelectPlayer
					playerNumber={2}
					players={playersQuery.data}
					selectedPlayerId={selectedPlayer2Id}
					onChange={setSelectedPlayer2Id}
				/>
			</fieldset>
			<fieldset className="col-span-full mx-6 mb-8 grid items-center gap-2 lg:col-start-2 lg:col-end-6">
				<legend className="mb-2 text-sm font-medium text-slate-100">Team 2</legend>
				<SelectPlayer
					playerNumber={3}
					players={playersQuery.data}
					selectedPlayerId={selectedPlayer3Id}
					onChange={setSelectedPlayer3Id}
				/>
				<SelectPlayer
					playerNumber={4}
					players={playersQuery.data}
					selectedPlayerId={selectedPlayer4Id}
					onChange={setSelectedPlayer4Id}
				/>
			</fieldset>
			<div className="col-span-full justify-self-center">
				<Button type="submit" disabled={!submitButtonEnabled}>
					Spiel starten
				</Button>
			</div>
		</form>
	);
};
