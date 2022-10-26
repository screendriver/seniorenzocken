<script lang="ts">
	import Maybe, { transposeArray } from "true-myth/maybe";
	import Unit from "true-myth/unit";
	import CancelGame from "./CancelGame.svelte";
	import GamePoint, { type GamePointChangeEvent } from "./GamePoint.svelte";
	import { teams } from "../team/teams-store";
	import Button from "../Button.svelte";

	let gamePointComponents: GamePoint[] = [];
	let enabledTeamNumber: Maybe<number> = Maybe.nothing();
	let desiredTeamGamePoint: Maybe<number> = Maybe.nothing();

	$: nextRoundDisabled = transposeArray([enabledTeamNumber, desiredTeamGamePoint]).isNothing;

	function disableGamePoint(event: CustomEvent<GamePointChangeEvent>): void {
		const { teamNumber, gamePoint } = event.detail;

		if (gamePoint === 0) {
			enabledTeamNumber = Maybe.nothing();
			desiredTeamGamePoint = Maybe.nothing();
		} else {
			enabledTeamNumber = Maybe.just(teamNumber);
			desiredTeamGamePoint = Maybe.just(gamePoint);
		}
	}

	function nextRound(): void {
		function updateTeam(teamNumber: number) {
			return (gamePoint: number): Unit => {
				teams.update((teamsMap) => {
					const team = Maybe.of(teamsMap.get(teamNumber));

					if (team.isNothing) {
						return teamsMap;
					}

					teamsMap.set(teamNumber, {
						teamName: team.value.teamName,
						gamePoints: team.value.gamePoints + gamePoint
					});

					return new Map(teamsMap);
				});

				return Unit;
			};
		}

		Maybe.just(updateTeam).ap(enabledTeamNumber).ap(desiredTeamGamePoint);

		enabledTeamNumber = Maybe.nothing();
		desiredTeamGamePoint = Maybe.nothing();
		gamePointComponents.forEach((gamePointComponent) => {
			gamePointComponent.reset();
		});
	}
</script>

<form
	class="relative top-16 m-10 p-8 bg-slate-800 bg-opacity-90 rounded-lg shadow-md flex flex-col items-center gap-6 sm:max-w-lg sm:mx-auto"
>
	{#each Array.from($teams.keys()) as teamNumber, index}
		{@const disabled = enabledTeamNumber.mapOr(false, (enabledTeamNumberValue) => {
			return enabledTeamNumberValue !== teamNumber;
		})}

		<GamePoint
			{teamNumber}
			{disabled}
			bind:this={gamePointComponents[index]}
			on:gamepointchange={disableGamePoint}
		/>
	{/each}

	<Button buttonType="button" value="Nächste Runde" disabled={nextRoundDisabled} on:click={nextRound} />
	<CancelGame />
</form>
