<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useGameStore } from "../game-store/game-store.js";
import { determineWinnerTeam } from "../team/teams.js";

const gameStore = useGameStore();
const { team1, team2, isAudioPlaying, shouldPlayAudio } = storeToRefs(gameStore);

const isReplayAudioButtonDisabled = computed(() => {
	return isAudioPlaying.value || !shouldPlayAudio.value;
});

const wonText = determineWinnerTeam(team1, team2).mapOr("Gewonnen hat: ???", (team) => {
	return `Gewonnen hat: Team "${team.value.teamName}"`;
});
</script>

<template>
	<section class="col-span-full my-8 grid grid-cols-subgrid grid-rows-3 gap-2 lg:col-start-2 lg:col-end-6">
		<h1 class="col-span-full place-self-center">{{ wonText }}</h1>

		<button
			type="button"
			class="btn col-span-full mx-10 md:col-start-2 md:col-end-4 md:mx-0"
			@click="gameStore.startNewGame"
		>
			Neues Spiel
		</button>
		<button
			:disabled="isReplayAudioButtonDisabled"
			type="button"
			class="btn col-span-full mx-10 md:col-start-2 md:col-end-4 md:mx-0"
			@click="isAudioPlaying = true"
		>
			Punktestand vorlesen
		</button>
	</section>
</template>
