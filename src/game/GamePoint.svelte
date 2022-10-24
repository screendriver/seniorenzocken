<script lang="ts" context="module">
	export interface GamePointChangeEvent {
		readonly gamePoint: number;
		readonly teamNumber: number;
		readonly team: Team;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { UsersIcon } from "svelte-feather-icons";
	import type { Team } from "../team/teams-store";

	export let teamNumber: number;
	export let team: Team;
	export let disabled: boolean;

	const dispatch = createEventDispatcher<{ gamepointchange: GamePointChangeEvent }>();
	const rangeInputId = `team-${teamNumber}`;

	let gamePoint = 0;

	$: if (gamePoint === 1) {
		gamePoint = 2;
	}

	$: if (gamePoint !== 1) {
		dispatch("gamepointchange", {
			gamePoint,
			teamNumber,
			team
		});
	}
</script>

<section class="w-full pb-2 flex flex-col gap-3 bg-slate-600 rounded-lg">
	<label for={rangeInputId} class="flex items-center gap-2 bg-sky-700 rounded-lg">
		<UsersIcon size="40" class="rounded-l-lg border-r-2 border-r-sky-600 bg-sky-700 p-2" />
		{team.teamName}:
	</label>
	<input type="range" min="0" max="4" id={rangeInputId} bind:value={gamePoint} {disabled} class="w-11/12 m-auto" />
	<output class="block text-center text-xl font" for={rangeInputId}>{gamePoint}</output>
</section>
