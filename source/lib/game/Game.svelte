<script lang="ts">
	import { ButtonGroup, Button } from "flowbite-svelte";
	import GamePoint from "./GamePoint.svelte";
	import canvasConfetti from "canvas-confetti";
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
	class="flex relative -top-20 flex-col gap-6 items-center p-8 mx-5 bg-opacity-90 rounded-lg shadow-md sm:mx-auto sm:max-w-lg bg-slate-800"
>
	{#each $gameStore.teams as team (team.teamNumber)}
		{@const enabled = (allTeamsAtZeroGamePoints || team.currentGamePoints > 0) && !$gameStore.audioPlaying}

		<GamePoint {team} {enabled} />
	{/each}

	<ButtonGroup>
		<Button disabled={!previousGameRoundEnabled} on:click={gameStore.previousGameRound} color="yellow"
			>Runde Zurück</Button
		>

		<Button disabled={!nextGameRoundEnabled} on:click={gameStore.nextGameRound} color="primary">
			Nächste Runde
		</Button>
	</ButtonGroup>
</form>
