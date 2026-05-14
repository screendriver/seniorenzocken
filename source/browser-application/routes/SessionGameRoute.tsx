import { Fragment, useEffect, useRef, type CSSProperties, type FunctionComponent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertErrorMessage } from "../alert/AlertErrorMessage.js";
import { useApplicationContext } from "../context/app-context.js";
import { RandomFunAudioNew, type RandomFunAudioNewHandle } from "../random-fun-audio/RandomFunAudioNew.js";
import { useGamePoints } from "../game-points/game-points.js";
import { Badge } from "../ui/badge.js";
import { Button } from "../ui/button.js";

export const SessionGameRoute: FunctionComponent = () => {
	const applicationContext = useApplicationContext();
	const { trpc } = applicationContext;
	const randomFunAudioReference = useRef<RandomFunAudioNewHandle>(null);
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const {
		selectedGamePoints,
		setSelectedGamePoints,
		isPreviousGameRoundEnabled,
		isNextGameRoundEnabled,
		selectedGamePoint,
		isGameOver,
		isGamePointEnabled,
		fillSelectedGamePoints,
		clearSelectedGamePoints
	} = useGamePoints();

	const currentGameRoundQuery = useQuery(trpc.session.currentGameRound.queryOptions());
	const currentGameRoundQueryKey = trpc.session.currentGameRound.queryKey();

	const nextGameRoundMutation = useMutation(
		trpc.session.nextGameRound.mutationOptions({
			async onSuccess() {
				clearSelectedGamePoints();
				await queryClient.invalidateQueries({ queryKey: currentGameRoundQueryKey });
			}
		})
	);

	const previousGameRoundMutation = useMutation(
		trpc.session.previousGameRound.mutationOptions({
			async onSuccess() {
				clearSelectedGamePoints();
				await queryClient.invalidateQueries({ queryKey: currentGameRoundQueryKey });
			}
		})
	);

	useEffect(() => {
		fillSelectedGamePoints(currentGameRoundQuery.data);
	}, [currentGameRoundQuery.data, fillSelectedGamePoints]);

	if (currentGameRoundQuery.fetchStatus === "fetching" && currentGameRoundQuery.data === undefined) {
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
					<AlertErrorMessage errorMessage="Spielstand konnte nicht geladen werden" />
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

	if (currentGameRoundQuery.data === undefined) {
		return null;
	}

	if (isGameOver) {
		return <Navigate to="/game-over" replace={true} />;
	}

	const currentGameRound = currentGameRoundQuery.data;

	return (
		<Fragment>
			<RandomFunAudioNew ref={randomFunAudioReference} />
			{currentGameRound.teams.map((team) => {
				const gamePointsStyle: CSSProperties & { readonly "--value": number } = { "--value": team.gamePoints };

				return (
					<section
						key={team.teamId}
						className="col-span-4 rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-md md:col-start-3 lg:col-start-5"
					>
						<h2 className="mb-4 flex items-center justify-between text-xl font-bold">
							{team.name}
							<Badge variant="secondary" className="rounded-md">
								<span style={gamePointsStyle}>{team.gamePoints}</span>
							</Badge>
						</h2>
						<div className="mt-4 flex justify-between gap-2">
							{currentGameRound.gamePointsPerRound.map((gamePointPerRound) => {
								return (
									<input
										key={`${team.teamId}-${gamePointPerRound}`}
										type="radio"
										className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 flex-grow rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
										value={gamePointPerRound}
										disabled={!isGamePointEnabled(team.teamId)}
										name={team.name}
										aria-label={gamePointPerRound.toString()}
										checked={selectedGamePoints[team.teamId] === gamePointPerRound}
										onChange={() => {
											randomFunAudioReference.current?.playEmptyAudio();
											setSelectedGamePoints({
												...selectedGamePoints,
												[team.teamId]: gamePointPerRound
											});
										}}
									/>
								);
							})}
						</div>
					</section>
				);
			})}
			<div className="col-span-4 flex justify-center gap-2 self-start md:col-span-8 lg:col-span-12">
				<Button
					disabled={!isPreviousGameRoundEnabled}
					type="button"
					onClick={() => {
						previousGameRoundMutation.mutate();
					}}
				>
					Runde zurück
				</Button>
				<Button
					disabled={!isNextGameRoundEnabled}
					type="button"
					onClick={() => {
						const selected = selectedGamePoint.match({
							Just(selectedGamePointValue) {
								return selectedGamePointValue;
							},
							Nothing() {
								throw new Error("No game point selected");
							}
						});

						nextGameRoundMutation.mutate({
							teamId: selected.teamId,
							gamePoints: selected.selectedGamePoint
						});
					}}
				>
					Nächste Runde
				</Button>
			</div>
		</Fragment>
	);
};
