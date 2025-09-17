<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { assertDefined } from "ts-extras";
import { useQuery } from "@tanstack/vue-query";
import { isDefined } from "@vueuse/core";
import { trpcClientInjectionKey } from "../trpc/client.js";
import { useSessionGameStore } from "../game-store/session-game-store.js";

type SelectedRadioButton = {
	readonly teamId: number;
	readonly selectedGamePoint: number;
};

const trpcClient = inject(trpcClientInjectionKey);

assertDefined(trpcClient);

const sessionGameStore = useSessionGameStore();
const selectedRadioButton = ref<SelectedRadioButton>({ teamId: -1, selectedGamePoint: 0 });

const { isSuccess, data: currentGameRoundData } = useQuery({
	queryKey: ["currentGameRound"],
	async queryFn() {
		return trpcClient.session.currentGameRound.query();
	}
});

function isGamePointEnabled(teamId: number): boolean {
	if (sessionGameStore.isAudioPlaying) {
		return false;
	}

	if (selectedRadioButton.value.selectedGamePoint === 0) {
		return true;
	}

	return selectedRadioButton.value.teamId === teamId && selectedRadioButton.value.selectedGamePoint > 0;
}

const isPreviousGameRoundEnabled = computed(() => {
	return currentGameRoundData.value?.hasPreviousGameRounds === true && !sessionGameStore.isAudioPlaying;
});

const isNextGameRoundEnabled = computed(() => {
	return selectedRadioButton.value.selectedGamePoint > 0 && !sessionGameStore.isAudioPlaying;
});

function setSelectedGamePoint(teamId: number, changeEvent: Readonly<Event>): void {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- needs a type guard
	const inputElement = changeEvent.target as HTMLInputElement;

	selectedRadioButton.value = { teamId, selectedGamePoint: Number.parseInt(inputElement.value, 10) };
}
</script>

<template>
	<template v-if="isSuccess && isDefined(currentGameRoundData)">
		<template v-for="team in currentGameRoundData.teams" :key="team.id">
			<section class="bg-primary col-span-4 rounded-lg border p-4 shadow-md md:col-start-3 lg:col-start-5">
				<h2 class="mb-4 text-xl font-bold">{{ team.name }}</h2>

				<div class="join mt-4 flex justify-between">
					<input
						v-for="gamePointPerRound in currentGameRoundData.gamePointsPerRound"
						type="radio"
						:key="`${team.id}-${gamePointPerRound}`"
						:value="gamePointPerRound.toString()"
						:disabled="!isGamePointEnabled(team.id)"
						:name="team.name"
						:aria-label="gamePointPerRound.toString()"
						@change="setSelectedGamePoint(team.id, $event)"
						class="btn join-item btn-outline flex-grow"
					/>
				</div>
			</section>
		</template>

		<div class="join col-span-4 justify-center self-start md:col-span-8 lg:col-span-12">
			<button :disabled="!isPreviousGameRoundEnabled" type="button" class="btn btn-primary join-item">
				Runde zurück
			</button>

			<button :disabled="!isNextGameRoundEnabled" type="button" class="btn btn-primary">Nächste Runde</button>
		</div>
	</template>
</template>
