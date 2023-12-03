<script lang="ts">
	import { Button } from "flowbite-svelte";
	import type { TeamNameChangeEvent } from "./Team.svelte";
	import Team from "./Team.svelte";
	import { gameStore } from "../game-store/game-store.js";
	import { canGameBeStarted } from "../game-store/can-game-be-started.js";

	function updateChangedTeamName(event: CustomEvent<TeamNameChangeEvent>): void {
		gameStore.updateTeamName(event.detail.team, event.detail.teamName);
	}
</script>

<form
	name="teams"
	on:submit|preventDefault
	class="relative -top-20 bg-slate-800 bg-opacity-90 rounded-lg shadow-md mx-5 sm:mx-auto sm:max-w-xl py-8 flex flex-col items-center gap-3 m-auto"
>
	<Team team={$gameStore.teams[0]} on:teamNameChange={updateChangedTeamName} />
	<Team team={$gameStore.teams[1]} on:teamNameChange={updateChangedTeamName} />

	<Button disabled={!canGameBeStarted($gameStore.teams)} on:click={gameStore.startGame}>Spiel starten</Button>
</form>
