<script setup lang="ts">
import { inject, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { assertDefined } from "ts-extras";
import { useQuery } from "@tanstack/vue-query";
import { isUndefined } from "@sindresorhus/is";
import { trpcClientInjectionKey } from "../trpc/client";

const trpcClient = inject(trpcClientInjectionKey);

assertDefined(trpcClient);

const router = useRouter();
const wonText = ref("");
const { isSuccess, data: currentGameRoundData } = useQuery({
	queryKey: ["currentGameRound"],
	async queryFn() {
		return trpcClient.session.currentGameRound.query();
	}
});

watch(currentGameRoundData, async (currentGameRoundDataValue) => {
	if (isUndefined(currentGameRoundDataValue)) {
		return;
	}

	if (currentGameRoundDataValue.isGameOver) {
		wonText.value = `Gewonnen hat: ${currentGameRoundDataValue.winnerTeam.name}`;
	} else {
		await router.push({ name: "session-game", replace: true });
	}
});
</script>

<template>
	<template v-if="isSuccess && currentGameRoundData?.isGameOver === true">
		<section class="bg-primary col-span-4 rounded-lg border p-4 shadow-md md:col-start-3 lg:col-start-5">
			<h1 class="text-center">{{ wonText }}</h1>

			<div>
				<button type="button" class="btn btn-secondary join-item">Neues Spiel</button>

				<button type="button" class="btn btn-secondary">Punktestand vorlesen</button>
			</div>
		</section>
	</template>
</template>
