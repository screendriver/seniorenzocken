<script lang="ts">
	import canvasConfetti from "canvas-confetti";
	import GamePoint from "./GamePoint.svelte";
	import { gameStore } from "../game-store/game-store.js";

	$: allTeamsAtZeroGamePoints = $gameStore.teams.every((team) => {
		return team.currentGamePoints === 0;
	});

	$: if ($gameStore.shouldShowConfetti) {
		void canvasConfetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
		})?.then(() => {
			gameStore.hideConfetti();
		});
	}

	$: nextGameRoundEnabled = !allTeamsAtZeroGamePoints && !$gameStore.audioPlaying;
	$: previousGameRoundEnabled = !$gameStore.gameRounds.empty() && !$gameStore.audioPlaying;
</script>

<form
	on:submit|preventDefault
	class="-top-20 gap-6 items-center p-8 mx-5 rounded-lg sm:mx-auto sm:max-w-lg card bg-base-200/90"
>
	{#each $gameStore.teams as team (team.teamNumber)}
		{@const enabled = (allTeamsAtZeroGamePoints || team.currentGamePoints > 0) && !$gameStore.audioPlaying}

		<GamePoint {team} {enabled} />
	{/each}

	<div class="join">
		<button
			type="button"
			class="btn btn-secondary join-item"
			disabled={!previousGameRoundEnabled}
			on:click={gameStore.previousGameRound}
		>
			Runde zurück
		</button>

		<button
			type="button"
			class="btn btn-primary join-item"
			disabled={!nextGameRoundEnabled}
			on:click={gameStore.nextGameRound}
		>
			Nächste Runde
		</button>
	</div>
</form>
