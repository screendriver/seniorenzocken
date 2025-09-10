<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { isDefined } from "@vueuse/core";
import { isUndefined } from "@sindresorhus/is";
import { useTRPCClientStore } from "../trpc-client-store/trpc-client-store.js";
import { useSessionGameStore } from "../game-store/session-game-store.js";

const sessionGameStore = useSessionGameStore();
const { trpcClient } = useTRPCClientStore();
const selectedGamePoint = ref<Record<number, number>>({});

const { isSuccess, data: currentGameRoundData } = useQuery({
	queryKey: ["currentGameRound"],
	async queryFn() {
		return trpcClient.session.currentGameRound.query();
	}
});

watch(currentGameRoundData, () => {
	if (isUndefined(currentGameRoundData.value)) {
		return;
	}

	selectedGamePoint.value = currentGameRoundData.value.teams.reduce((previousTeam, team) => {
		return {
			...previousTeam,
			[team.id]: 0
		};
	}, {});
});

const allTeamsHasZeroGamePoints = computed(() => {
	return Object.values(selectedGamePoint.value).every((gamePoint) => {
		return gamePoint === 0;
	});
});

function isGamePointEnabled(teamId: number): boolean {
	if (sessionGameStore.isAudioPlaying) {
		return false;
	}

	const selectedTeamGamePoint = selectedGamePoint.value[teamId];

	if (isUndefined(selectedTeamGamePoint)) {
		return true;
	}

	return allTeamsHasZeroGamePoints.value || selectedTeamGamePoint > 0;
}

const isPreviousGameRoundEnabled = computed(() => {
	return currentGameRoundData.value?.hasPreviousGameRounds === true && !sessionGameStore.isAudioPlaying;
});

const isNextGameRoundEnabled = computed(() => {
	return !allTeamsHasZeroGamePoints.value && !sessionGameStore.isAudioPlaying;
});

function setSelectedGamePoint(teamId: number, changeEvent: Readonly<Event>): void {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- needs a type guard
	const inputElement = changeEvent.target as HTMLInputElement;

	selectedGamePoint.value[teamId] = Number.parseInt(inputElement.value, 10);
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
