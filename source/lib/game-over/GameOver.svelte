<script lang="ts">
	import { Button } from "flowbite-svelte";
	import GameOverAudio from "../audio/GameOverAudio.svelte";
	import { settingsStore } from "../settings/settings-store.js";
	import { gameStore } from "../game-store/game-store.js";
	import { determineWinnerTeam } from "../team/teams.js";

	export let apiRouteBaseUrl: URL;

	let isAudioPlaying = true;

	const winnerTeam = determineWinnerTeam($gameStore.teams);
	const wonText = winnerTeam.mapOr("Gewonnen hat: ???", (team) => {
		return `Gewonnen hat: Team "${team.teamName}"`;
	});

	function onAudioEnded(): void {
		isAudioPlaying = false;
	}

	function replayAudio(): void {
		isAudioPlaying = true;
	}
</script>

<section
	class="flex flex-col gap-6 items-center p-8 m-10 mt-16 bg-opacity-90 rounded-lg shadow-md sm:mx-auto sm:max-w-lg bg-slate-800"
>
	<h1>{wonText}</h1>

	<Button on:click={gameStore.startNewGame}>Neues Spiel</Button>
	<Button disabled={isAudioPlaying || !$settingsStore.audioEnabled} on:click={replayAudio}
		>Punktestand vorlesen</Button
	>

	{#if $settingsStore.audioEnabled && isAudioPlaying}
		<GameOverAudio {apiRouteBaseUrl} on:audioEnded={onAudioEnded} />
	{/if}
</section>
