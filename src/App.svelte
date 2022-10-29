<script lang="ts">
	import type ImageKit from "imagekit-javascript";
	import { useMachine } from "@xstate/svelte/es/fsm";
	import Head from "./Header.svelte";
	import TeamsForm from "./team/TeamsForm.svelte";
	import { isGameOver } from "./game/game-store.js";
	import Game from "./game/Game.svelte";
	import GameOver from "./game/GameOver.svelte";
	import type { GameStateMachine } from "./game-state/game-state-machine.js";

	export let imageKit: ImageKit;
	export let gameStateMachine: GameStateMachine;

	const { state, send } = useMachine(gameStateMachine);

	function startGame(): void {
		send("START_GAME");
	}

	function startNewGame(): void {
		send("START_NEW_GAME");
	}
</script>

<Head {imageKit} />

{#if $isGameOver}
	<GameOver on:startnewgame={startNewGame} />
{:else if $state.value === "gameRunning"}
	<Game />
{:else}
	<TeamsForm on:gamestarted={startGame} />
{/if}
