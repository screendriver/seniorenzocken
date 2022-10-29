<script lang="ts">
	import type ImageKit from "imagekit-javascript";
	import Head from "./Header.svelte";
	import TeamsForm from "./team/TeamsForm.svelte";
	import { isGameStarted, isGameOver } from "./game/game-store.js";
	import Game from "./game/Game.svelte";
	import GameOver from "./game/GameOver.svelte";

	export let imageKit: ImageKit;

	function startGame(): void {
		$isGameStarted = true;
	}
</script>

<Head {imageKit} />

{#if $isGameOver}
	<GameOver />
{:else if $isGameStarted}
	<Game />
{:else}
	<TeamsForm on:gamestarted={startGame} />
{/if}
