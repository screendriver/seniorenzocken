<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { isEmptyString } from "@sindresorhus/is";
import { useGameStore } from "../game-store/game-store";

const router = useRouter();
const gameStore = useGameStore();
const { hasError, team1, team2 } = storeToRefs(gameStore);

const inputClassNames = "flex gap-2 items-center whitespace-nowrap col-span-full input input-bordered";

onMounted(async () => {
	await gameStore.newGame();
});

const isSubmitDisabled = computed<boolean>(() => {
	return hasError.value || isEmptyString(team1.value.name) || isEmptyString(team2.value.name);
});

async function startGame(): Promise<void> {
	const startGameResult = await gameStore.startGame();

	if (startGameResult.isOk) {
		router.push({ name: "game", replace: true });
	}
}
</script>

<template>
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
