<script lang="ts">
	import type ImageKit from "imagekit-javascript";
	import { useMachine } from "@xstate/svelte";
	import canvasConfetti from "canvas-confetti";
	import Head from "./Header.svelte";
	import TeamsForm from "./team/TeamsForm.svelte";
	import Game, { type NextRoundEvent } from "./game/Game.svelte";
	import GameOver from "./game/GameOver.svelte";
	import type { TeamNameChangeEvent } from "./team/Team.svelte";
	import GitHub from "./GitHub.svelte";
	import GamePointAudio from "./audio/GamePointAudio.svelte";
	import GameOverAudio from "./audio/GameOverAudio.svelte";
	import type { GameStateMachine } from "./game-state/game-state-machine.js";
	import type { WakeLockStateMachine } from "./screen/wake-lock-state-machine.js";

	export let imageKit: ImageKit;
	export let gameStateMachine: GameStateMachine;
	export let wakeLockStateMachine: WakeLockStateMachine;

	const { state, send } = useMachine(gameStateMachine);
	useMachine(wakeLockStateMachine);

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

	function sendAudioEnded(): void {
		send({ type: "AUDIO_ENDED" });
	}

	function startNewGame(): void {
		send("START_NEW_GAME");
	}

	$: if ($state.matches("gameRunning.audio.playing") && $state.matches("gameRunning.confetti.visible")) {
		canvasConfetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 }
		});
	}

	$: teams = $state.context.teams;
</script>

<Head {imageKit} />

{#if $state.value === "gameOver"}
	<GameOver {teams} on:startnewgame={startNewGame} />
	<GameOverAudio />
{:else if $state.matches("gameRunning")}
	{@const audioPlaying = $state.matches("gameRunning.audio.playing")}

	<Game {teams} disabled={audioPlaying} on:nextround={updateGamePoint} />

	{#if audioPlaying}
		<GamePointAudio {teams} on:audioended={sendAudioEnded} />
	{/if}
{:else}
	<TeamsForm
		canGameBeStarted={$state.context.canGameBeStarted}
		on:teamnamechange={updateTeamName}
		on:startgame={startGame}
	/>
{/if}

<footer class="absolute bottom-5 right-5 flex justify-end w-full">
	<a href="https://github.com/screendriver/seniorenzocken" title="GitHub">
		<GitHub />
	</a>
</footer>
