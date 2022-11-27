<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import GameOverAudio from "../audio/GameOverAudio.svelte";
	import Button from "../Button.svelte";
	import { determineWinnerTeam } from "../game-state/teams.js";
	import type { Teams } from "../team/team-schema.js";

	export let playAudio: boolean;
	export let teams: Teams;

	const dispatch = createEventDispatcher<{ startnewgame: void; replayaudio: void }>();

	const winnerTeam = determineWinnerTeam(teams);

	function resetGame(): void {
		dispatch("startnewgame");
	}

	function replayAudio(): void {
		dispatch("replayaudio");
	}
</script>

{#if playAudio}
	<GameOverAudio {teams} on:audioended />
{/if}

{#if winnerTeam.isOk}
	<section
		class="mt-16 m-10 p-8 flex flex-col gap-6 items-center bg-slate-800 bg-opacity-90 rounded-lg shadow-md sm:max-w-lg sm:mx-auto"
	>
		<h1>Gewonnen hat: Team "{winnerTeam.value.teamName}"</h1>

		<Button value="Neues Spiel" disabled={playAudio} on:click={resetGame} />
		<Button value="Punktestand vorlesen" on:click={replayAudio} />
	</section>
{/if}
