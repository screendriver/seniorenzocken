<script lang="ts" context="module">
	export interface NextRoundEvent {
		readonly teamNumber: number;
		readonly gamePoints: number;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Maybe, { transposeArray } from "true-myth/maybe";
	import GamePoint, { type GamePointChangeEvent } from "./GamePoint.svelte";
	import Button from "../Button.svelte";
	import type { Teams } from "../team/team-schema.js";

	export let teams: Teams;
	export let disabled: boolean;

	let gamePointComponents: GamePoint[] = [];
	let enabledTeamNumber: Maybe<number> = Maybe.nothing();
	let desiredTeamGamePoint: Maybe<number> = Maybe.nothing();

	const dispatch = createEventDispatcher<{ nextround: NextRoundEvent }>();

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

	function resetState(): void {
		enabledTeamNumber = Maybe.nothing();
		desiredTeamGamePoint = Maybe.nothing();
		gamePointComponents.forEach((gamePointComponent) => {
			gamePointComponent.reset();
		});
	}

	function dispatchNextRound(): void {
		function updateTeam(teamNumber: number) {
			return (gamePoints: number): boolean => {
				return dispatch("nextround", {
					teamNumber,
					gamePoints
				});
			};
		}

		Maybe.just(updateTeam).ap(enabledTeamNumber).ap(desiredTeamGamePoint);
	}
</script>

<form
	class="relative top-16 m-10 p-8 bg-slate-800 bg-opacity-90 rounded-lg shadow-md flex flex-col items-center gap-6 sm:max-w-lg sm:mx-auto"
>
	{#each Array.from(teams.keys()) as teamNumber, index (teamNumber)}
		{@const disabled = enabledTeamNumber.mapOr(false, (enabledTeamNumberValue) => {
			return enabledTeamNumberValue !== teamNumber;
		})}

		<GamePoint
			{teamNumber}
			{teams}
			{disabled}
			bind:this={gamePointComponents[index]}
			on:gamepointchange={disableGamePoint}
		/>
	{/each}

	<Button
		buttonType="button"
		value="Nächste Runde"
		disabled={disabled || nextRoundDisabled}
		on:click={() => {
			dispatchNextRound();
			resetState();
		}}
	/>
</form>
