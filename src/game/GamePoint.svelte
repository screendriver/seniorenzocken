<script lang="ts" context="module">
	export interface GamePointChangeEvent {
		readonly gamePoint: number;
		readonly teamNumber: TeamNumber;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { UsersIcon } from "svelte-feather-icons";
	import type { TeamNumber, Teams } from "../team/team-schema.js";
	import Score from "./Score.svelte";

	export let teamNumber: TeamNumber;
	export let teams: Teams;
	export let disabled: boolean;

	const dispatch = createEventDispatcher<{ gamepointchange: GamePointChangeEvent }>();
	const rangeInputId = `team-${teamNumber}`;

	let gamePoint = 0;
	$: if (gamePoint === 1) {
		gamePoint = 2;
	}
	$: rangeStep = gamePoint >= 2 ? 1 : 2;
	$: team = teams[teamNumber];

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
	<label
		for={rangeInputId}
		class="flex justify-between items-center gap-2 rounded-lg {team.isStretched ? 'bg-red-400' : 'bg-sky-700'}"
	>
		<UsersIcon size="40" class="rounded-l-lg border-r-2 border-r-sky-600 bg-sky-700 p-2" />
		<cite class="flex-grow not-italic">{team.teamName}</cite>
		<mark class="px-2 mr-2 rounded-full bg-sky-600 text-slate-200 shadow">{team.gamePoints}</mark>
	</label>
	<output for={rangeInputId} class="w-11/12 m-auto px-0.5 flex justify-between text-xl">
		<Score score={0} visible={true} />
		<Score score={1} visible={false} />
		<Score score={2} visible={true} />
		<Score score={3} visible={true} />
		<Score score={4} visible={true} />
	</output>
	<input
		type="range"
		min="0"
		max="4"
		id={rangeInputId}
		step={rangeStep}
		bind:value={gamePoint}
		on:input={dispatchGamePointChangeEvent}
		{disabled}
		class="w-11/12 m-auto"
	/>
</section>
