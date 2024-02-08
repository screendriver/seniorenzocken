<script lang="ts">
	import { Label, Range } from "flowbite-svelte";
	import { UsersIcon } from "svelte-feather-icons";
	import type { Team } from "../game-store/team.js";
	import { gameStore } from "../game-store/game-store.js";
	import Score from "./Score.svelte";

	export let team: Team;
	export let enabled: boolean;

	function setGamePoint(changeEvent: Event): void {
		const currentTarget = changeEvent.currentTarget as HTMLInputElement;
		const gamePoint = parseInt(currentTarget.value, 10);

		if (gamePoint === 1) {
			gameStore.setCurrentGamePoints(team, 2);
		} else {
			gameStore.setCurrentGamePoints(team, gamePoint);
		}
	}

	const rangeInputId = `team-${team.teamNumber}`;

	$: labelClassName = `text-slate-200 flex justify-between items-center gap-2 rounded-lg ${
		team.isStretched ? "bg-red-400" : "bg-sky-700"
	}`;
</script>

<section class="flex flex-col gap-3 pb-4 w-full rounded-lg bg-slate-600">
	<Label for={rangeInputId} class={labelClassName}>
		<UsersIcon size="40" class="p-2 rounded-l-lg border-r-2 border-r-sky-600 bg-sky-700" />
		<cite class="flex-grow not-italic">{team.teamName}</cite>
		<mark class="px-2 mr-2 rounded-full shadow bg-sky-600 text-slate-200">{team.totalGamePoints}</mark>
	</Label>
	<output for={rangeInputId} class="flex justify-between px-0.5 m-auto w-11/12 text-xl">
		<Score score={0} visible={true} />
		<Score score={1} visible={false} />
		<Score score={2} visible={true} />
		<Score score={3} visible={true} />
		<Score score={4} visible={true} />
	</output>
	<Range
		min="0"
		max="4"
		id={rangeInputId}
		step="1"
		value={team.currentGamePoints}
		on:change={setGamePoint}
		disabled={!enabled}
		class="my-2 mx-auto w-11/12"
	/>
</section>
