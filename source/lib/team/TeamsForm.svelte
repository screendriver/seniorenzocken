<script lang="ts">
	import type { TeamNameChangeEvent } from "./Team.svelte";
	import Team from "./Team.svelte";
	import { gameStore } from "../game-store/game-store.js";
	import { canGameBeStarted } from "../game-store/can-game-be-started.js";

	function updateChangedTeamName(event: CustomEvent<TeamNameChangeEvent>): void {
		gameStore.updateTeamName(event.detail.team, event.detail.teamName);
	}
</script>

<div class="-top-20 items-center m-auto mx-5 shadow-md sm:mx-auto sm:max-w-xl card bg-base-200/90">
	<form name="teams" on:submit|preventDefault class="card-body">
		<Team team={$gameStore.teams[0]} on:teamNameChange={updateChangedTeamName} />
		<Team team={$gameStore.teams[1]} on:teamNameChange={updateChangedTeamName} />

		<div class="justify-center card-actions">
			<button
				type="button"
				class="btn btn-primary"
				disabled={!canGameBeStarted($gameStore.teams)}
				on:click={gameStore.startGame}
			>
				Spiel starten
			</button>
		</div>
	</form>
</div>
