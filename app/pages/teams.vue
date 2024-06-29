<script setup lang="ts">
import { isEmptyString } from "@sindresorhus/is";

const gameStore = useGameStore();
const { team1, team2 } = storeToRefs(gameStore);

const inputClassNames = "flex gap-2 items-center whitespace-nowrap col-span-full input input-bordered";

const isSubmitDisabled = computed<boolean>(() => {
	return isEmptyString(team1.value.teamName) || isEmptyString(team2.value.teamName);
});

function navigateToGame(): void {
	navigateTo({ path: "/game", replace: true });
}
</script>

<template>
	<section
		class="col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl bg-secondary sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10"
	>
		<form
			class="items-center col-span-full mx-6 lg:col-start-2 lg:col-end-6 my-8 grid-flow-col grid-rows-3 gap-2 grid grid-cols-subgrid"
			@submit.prevent="navigateToGame"
		>
			<label :class="inputClassNames">
				Team 1
				<input id="team1-name" v-model="gameStore.team1.teamName" type="text" placeholder="Name" class="grow" />
			</label>
			<label :class="inputClassNames">
				Team 2
				<input id="team2-name" v-model="gameStore.team2.teamName" type="text" placeholder="Name" class="grow" />
			</label>
			<div class="col-span-full justify-self-center">
				<input :disabled="isSubmitDisabled" type="submit" value="Spiel starten" class="btn btn-primary" />
			</div>
		</form>
	</section>
</template>
