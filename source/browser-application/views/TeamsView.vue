<script setup lang="ts">
import { computed, inject, onMounted, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { isEmptyString } from "@sindresorhus/is";
import { assertDefined } from "ts-extras";
import RandomFunAudio from "../random-fun-audio/RandomFunAudio.vue";
import { useGameStore } from "../game-store/game-store.js";
import { trpcClientInjectionKey } from "../trpc/client";

const trpcClient = inject(trpcClientInjectionKey);

assertDefined(trpcClient);

const randomFunAudioReference = useTemplateRef("randomFunAudio");
const router = useRouter();
const gameStore = useGameStore(trpcClient);
const { hasError, team1, team2 } = storeToRefs(gameStore);

const inputClassNames = "input input-bordered col-span-full w-full";

onMounted(async () => {
	await gameStore.newGame();
});

const isSubmitDisabled = computed<boolean>(() => {
	return hasError.value || isEmptyString(team1.value.name) || isEmptyString(team2.value.name);
});

async function startGame(): Promise<void> {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- this rule should not complain here
	randomFunAudioReference.value?.playEmptyAudio();

	const startGameResult = await gameStore.startGame();

	if (startGameResult.isOk) {
		void router.push({ name: "game", replace: true });
	}
}
</script>

<template>
	<RandomFunAudio ref="randomFunAudio" />

	<section
		class="bg-neutral col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10"
	>
		<form
			class="col-span-full mx-6 my-8 grid grid-flow-col grid-cols-subgrid grid-rows-3 items-center gap-2 lg:col-start-2 lg:col-end-6"
			@submit.prevent="startGame"
		>
			<label :class="inputClassNames">
				Team 1
				<input v-model="gameStore.team1.name" id="team1-name" type="text" placeholder="Name" class="grow" />
			</label>

			<label :class="inputClassNames">
				Team 2
				<input v-model="gameStore.team2.name" id="team2-name" type="text" placeholder="Name" class="grow" />
			</label>

			<div class="col-span-full justify-self-center">
				<button :disabled="isSubmitDisabled" type="submit" class="btn btn-primary">Spiel starten</button>
			</div>
		</form>
	</section>
</template>
