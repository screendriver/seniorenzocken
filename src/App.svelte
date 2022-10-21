<script lang="ts">
	import TeamsForm from "./team/TeamsForm.svelte";
	import { isGameStarted } from "./game/game-store";

	function startGame(): void {
		$isGameStarted = true;
	}
</script>

<h1>Watten</h1>

{#if !$isGameStarted}
	<TeamsForm on:gamestarted={startGame} />
{/if}
