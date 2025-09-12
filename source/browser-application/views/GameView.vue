<script setup lang="ts">
import { inject } from "vue";
import canvasConfetti from "canvas-confetti";
import { storeToRefs } from "pinia";
import { assertDefined } from "ts-extras";
import { useConfetti } from "../confetti/use-confetti.js";
import { useGameStore } from "../game-store/game-store.js";
import GamePointsAudio from "../game-points/GamePointsAudio.vue";
import GameOver from "../game-over/GameOver.vue";
import GamePointForm from "../game-points/GamePointForm.vue";
import { trpcCilentInjectionKey } from "../trpc-client/trpc-client.js";

const trpcClient = inject(trpcCilentInjectionKey);

assertDefined(trpcClient);

useConfetti(canvasConfetti, trpcClient);

const gameStore = useGameStore(trpcClient);
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
