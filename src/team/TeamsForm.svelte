<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Team from "./Team.svelte";
	import { areTeamsFilled } from "./teams-store";

	const dispatch = createEventDispatcher();

	function startGame(): void {
		dispatch("gamestarted");
	}
</script>

<form
	name="teams"
	on:submit|preventDefault={startGame}
	class="bg-slate-800 rounded-lg mx-36 py-8 flex flex-col items-center gap-3 m-auto"
>
	{#each [1, 2] as teamNumber}
		<Team {teamNumber} />
	{/each}

	<input
		type="submit"
		value="Spiel starten"
		disabled={!$areTeamsFilled}
		class="bg-sky-500 text-white rounded-lg p-3 cursor-pointer hover:bg-sky-400 disabled:cursor-default disabled:hover:bg-sky-500 disabled:opacity-50"
	/>
</form>
