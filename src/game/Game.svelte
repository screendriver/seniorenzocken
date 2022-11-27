<script lang="ts" context="module">
	export interface NextRoundEvent {
		readonly teamNumber: TeamNumber;
		readonly gamePoints: number;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Maybe, { transposeArray } from "true-myth/maybe";
	import GamePoint, { type GamePointChangeEvent } from "./GamePoint.svelte";
	import Button from "../Button.svelte";
	import type { TeamNumber, Teams } from "../team/team-schema.js";

	export let teams: Teams;
	export let disabled: boolean;

	let gamePointComponents: GamePoint[] = [];
	let enabledTeamNumber: Maybe<TeamNumber> = Maybe.nothing();
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
		function updateTeam(teamNumber: TeamNumber) {
			return (gamePoints: number): boolean => {
				return dispatch("nextround", {
					teamNumber,
					gamePoints
				});
			};
		}

		Maybe.just(updateTeam).ap(enabledTeamNumber).ap(desiredTeamGamePoint);
	}

	function isTeamNumber(teamNumber: number): teamNumber is TeamNumber {
		return teamNumber === 0 || teamNumber === 1;
	}
</script>

<form
	class="relative top-16 m-10 p-8 bg-slate-800 bg-opacity-90 rounded-lg shadow-md flex flex-col items-center gap-6 sm:max-w-lg sm:mx-auto"
>
	{#each teams as team, teamNumber (team)}
		{#if isTeamNumber(teamNumber)}
			{@const disabled = enabledTeamNumber.mapOr(false, (enabledTeamNumberValue) => {
				return enabledTeamNumberValue !== teamNumber;
			})}

			<GamePoint
				{teamNumber}
				{teams}
				{disabled}
				bind:this={gamePointComponents[teamNumber]}
				on:gamepointchange={disableGamePoint}
			/>
		{/if}
	{/each}

	<Button
		value="Nächste Runde"
		disabled={disabled || nextRoundDisabled}
		on:click={() => {
			dispatchNextRound();
			resetState();
		}}
	/>
</form>
