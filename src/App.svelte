<script lang="ts">
	import type ImageKit from "imagekit-javascript";
	import { useMachine } from "@xstate/svelte/es/fsm";
	import Head from "./Header.svelte";
	import TeamsForm from "./team/TeamsForm.svelte";
	import Game, { type NextRoundEvent } from "./game/Game.svelte";
	import GameOver from "./game/GameOver.svelte";
	import type { GameStateMachine } from "./game-state/game-state-machine.js";
	import type { TeamNameChangeEvent } from "./team/Team.svelte";

	export let imageKit: ImageKit;
	export let gameStateMachine: GameStateMachine;

	const { state, send } = useMachine(gameStateMachine);

	function updateTeamName(event: CustomEvent<TeamNameChangeEvent>): void {
		send({
			type: "UPDATE_TEAM_NAME",
			teamNumber: event.detail.teamNumber,
			teamName: event.detail.teamName
		});
	}

	function startGame(): void {
		send("START_GAME");
	}

	function updateGamePoint(event: CustomEvent<NextRoundEvent>): void {
		send({
			type: "UPDATE_GAME_POINT",
			teamNumber: event.detail.teamNumber,
			gamePoints: event.detail.gamePoints
		});
	}

	function startNewGame(): void {
		send("START_NEW_GAME");
	}
</script>

<Head {imageKit} />

{#if $state.value === "gameOver"}
	<GameOver teams={$state.context.teams} on:startnewgame={startNewGame} />
{:else if $state.value === "gameRunning"}
	<Game teams={$state.context.teams} on:nextround={updateGamePoint} />
{:else}
	<TeamsForm
		canGameBeStarted={$state.context.canGameBeStarted}
		on:teamnamechange={updateTeamName}
		on:startgame={startGame}
	/>
{/if}
