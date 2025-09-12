<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { assertDefined } from "ts-extras";
import { tryOrElse } from "true-myth/task";
import { useGameStore } from "../game-store/game-store.js";
import { trpcCilentInjectionKey } from "../trpc-client/trpc-client.js";

const router = useRouter();
const gameStore = useGameStore();
const trpcClient = inject(trpcCilentInjectionKey);
const { team1, team2, isAudioPlaying } = storeToRefs(gameStore);

assertDefined(trpcClient);

const wonText = ref("");

onMounted(async () => {
	const winnerTeamResult = await tryOrElse(
		(error: unknown) => {
			return new Error("Could not determine winner team", { cause: error });
		},
		async () => {
			return trpcClient.game.determineWinnerTeam.query({ team1: team1.value, team2: team2.value });
		}
	);

	wonText.value = winnerTeamResult.mapOr("Gewonnen hat: ???", (winnerTeam) => {
		return `Gewonnen hat: Team "${winnerTeam.name}"`;
	});
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
