<script lang="ts">
	import type ImageKit from "imagekit-javascript";
	import Head from "./Header.svelte";
	import TeamsForm from "./team/TeamsForm.svelte";
	import { isGameStarted } from "./game/game-store";

	export let imageKit: ImageKit;

	function startGame(): void {
		$isGameStarted = true;
	}
</script>

<Head {imageKit} />

{#if !$isGameStarted}
	<TeamsForm on:gamestarted={startGame} />
{/if}
