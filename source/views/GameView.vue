<script setup lang="ts">
import canvasConfetti from "canvas-confetti";
import { storeToRefs } from "pinia";
import { useConfetti } from "../confetti/use-confetti";
import { useGameStore } from "../game-store/game-store";
import GamePointsAudio from "../game-points/GamePointsAudio.vue";
import GameOver from "../game-over/GameOver.vue";
import GamePointForm from "../game-points/GamePointForm.vue";

useConfetti(canvasConfetti);

const gameStore = useGameStore();
const { isAudioPlaying, isGameOver } = storeToRefs(gameStore);
</script>

<template>
	<section
		class="bg-neutral col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10"
	>
		<GamePointsAudio v-if="isAudioPlaying" />
		<GameOver v-if="isGameOver" />
		<GamePointForm v-else />
	</section>
</template>
