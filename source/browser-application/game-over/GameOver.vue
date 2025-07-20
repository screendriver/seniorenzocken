<script setup lang="ts">
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useGameStore } from "../game-store/game-store.ts";
import { determineWinnerTeam } from "../team/teams.ts";

const router = useRouter();
const gameStore = useGameStore();
const { team1, team2, isAudioPlaying } = storeToRefs(gameStore);

const wonText = determineWinnerTeam(team1, team2).mapOr("Gewonnen hat: ???", (winnerTeam) => {
	return `Gewonnen hat: Team "${winnerTeam.value.name}"`;
});

async function startNewGame(): Promise<void> {
	await router.push({ name: "teams", replace: true });
}
</script>

<template>
	<section class="col-span-full my-8 grid grid-cols-subgrid grid-rows-3 gap-2 lg:col-start-2 lg:col-end-6">
		<h1 class="col-span-full place-self-center">{{ wonText }}</h1>

		<button type="button" class="btn col-span-full mx-10 md:col-start-2 md:col-end-4 md:mx-0" @click="startNewGame">
			Neues Spiel
		</button>
		<button
			:disabled="isAudioPlaying"
			type="button"
			class="btn col-span-full mx-10 md:col-start-2 md:col-end-4 md:mx-0"
			@click="isAudioPlaying = true"
		>
			Punktestand vorlesen
		</button>
	</section>
</template>
