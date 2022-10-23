<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Button from "../Button.svelte";
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
	class="relative top-20 bg-slate-800 bg-opacity-90 rounded-lg shadow-md mx-5 sm:mx-auto sm:max-w-xl py-8 flex flex-col items-center gap-3 m-auto"
>
	{#each [1, 2] as teamNumber}
		<Team {teamNumber} />
	{/each}

	<Button buttonType="submit" value="Spiel starten" disabled={!$areTeamsFilled} />
</form>
