<script lang="ts">
	import Button from "../Button.svelte";
	import { winnerTeam } from "../team/teams-store";
	import { isGameStarted, isGameOver } from "./game-store";
	import { teams } from "../team/teams-store";

	function resetGame(): void {
		$isGameStarted = false;
		$isGameOver = false;
		$teams = new Map();
	}
</script>

{#if $winnerTeam.isOk}
	<section
		class="mt-16 m-10 p-8 flex flex-col gap-6 items-center bg-slate-800 bg-opacity-90 rounded-lg shadow-md sm:max-w-lg sm:mx-auto"
	>
		<h1>Gewonnen hat: Team "{$winnerTeam.value.teamName}"</h1>

		<Button buttonType="button" value="Neues Spiel" on:click={resetGame} />
	</section>
{/if}
