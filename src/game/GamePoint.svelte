<script lang="ts" context="module">
	export interface GamePointChangeEvent {
		readonly gamePoint: number;
		readonly teamNumber: number;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { UsersIcon } from "svelte-feather-icons";
	import Maybe from "true-myth/maybe";
	import { teams } from "../team/teams-store";

	export let teamNumber: number;
	export let disabled: boolean;

	const dispatch = createEventDispatcher<{ gamepointchange: GamePointChangeEvent }>();
	const rangeInputId = `team-${teamNumber}`;

	let gamePoint = 0;
	$: if (gamePoint === 1) {
		gamePoint = 2;
	}
	$: rangeStep = gamePoint >= 2 ? 1 : 2;
	$: team = Maybe.of($teams.get(teamNumber));

	function dispatchGamePointChangeEvent(): void {
		dispatch("gamepointchange", {
			gamePoint,
			teamNumber
		});
	}

	export function reset(): void {
		gamePoint = 0;
	}
</script>

<section class="w-full pb-4 flex flex-col gap-3 bg-slate-600 rounded-lg">
	<label for={rangeInputId} class="flex justify-between items-center gap-2 bg-sky-700 rounded-lg">
		<UsersIcon size="40" class="rounded-l-lg border-r-2 border-r-sky-600 bg-sky-700 p-2" />
		{#if team.isJust}
			<cite class="flex-grow not-italic">{team.value.teamName}</cite>
			<mark class="px-2 mr-2 rounded-full bg-sky-600 text-slate-200 shadow">{team.value.gamePoints}</mark>
		{/if}
	</label>
	<output class="block text-center text-xl" for={rangeInputId}>{gamePoint}</output>
	<input
		type="range"
		min="0"
		max="4"
		id={rangeInputId}
		step={rangeStep}
		bind:value={gamePoint}
		on:change={dispatchGamePointChangeEvent}
		{disabled}
		class="w-11/12 m-auto"
	/>
</section>
