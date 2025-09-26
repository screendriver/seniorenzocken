<script setup lang="ts">
import { inject, watch } from "vue";
import { assertDefined } from "ts-extras";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { isDefined } from "@vueuse/core";
import { trpcClientInjectionKey } from "../trpc/client.js";
import { useGamePoints } from "../game-points/game-points.js";

const trpcClient = inject(trpcClientInjectionKey);

assertDefined(trpcClient);

const queryClient = useQueryClient();
const {
	selectedGamePoints,
	isPreviousGameRoundEnabled,
	isNextGameRoundEnabled,
	selectedGamePoint,
	isGamePointEnabled,
	fillSelectedGamePoints,
	clearSelectedGamePoints
} = useGamePoints();

const { isSuccess, data: currentGameRoundData } = useQuery({
	queryKey: ["currentGameRound"],
	async queryFn() {
		return trpcClient.session.currentGameRound.query();
	}
});

const { mutate: nextGameRound } = useMutation({
	async mutationFn() {
		return selectedGamePoint.value.match({
			async Just(selected) {
				return trpcClient.session.nextGameRound.mutate({
					teamId: selected.teamId,
					gamePoints: selected.selectedGamePoint
				});
			},
			Nothing() {
				throw new Error("No game point selected");
			}
		});
	},
	async onSuccess() {
		clearSelectedGamePoints();
		await queryClient.invalidateQueries({ queryKey: ["currentGameRound"] });
	}
});

watch(currentGameRoundData, fillSelectedGamePoints);
</script>

<template>
	<template v-if="isSuccess && isDefined(currentGameRoundData)">
		<template v-for="team in currentGameRoundData.teams" :key="team.teamId">
			<section class="bg-primary col-span-4 rounded-lg border p-4 shadow-md md:col-start-3 lg:col-start-5">
				<h2 class="mb-4 text-xl font-bold">{{ team.name }}</h2>

				<div class="join mt-4 flex justify-between">
					<input
						v-for="gamePointPerRound in currentGameRoundData.gamePointsPerRound"
						type="radio"
						v-model.number="selectedGamePoints[team.teamId]"
						class="btn join-item btn-outline flex-grow"
						:key="`${team.teamId}-${gamePointPerRound}`"
						:value="gamePointPerRound"
						:disabled="!isGamePointEnabled(team.teamId)"
						:name="team.name"
						:aria-label="gamePointPerRound.toString()"
					/>
				</div>
			</section>
		</template>

		<div class="join col-span-4 justify-center self-start md:col-span-8 lg:col-span-12">
			<button :disabled="!isPreviousGameRoundEnabled" type="button" class="btn btn-primary join-item">
				Runde zurück
			</button>

			<button @click="nextGameRound()" :disabled="!isNextGameRoundEnabled" type="button" class="btn btn-primary">
				Nächste Runde
			</button>
		</div>
	</template>
</template>
