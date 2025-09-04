<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { isNonEmptyArray } from "@sindresorhus/is";
import SelectPlayer from "../teams-selection/SelectPlayer.vue";
import { useTRPCClientStore } from "../trpc-client-store/trpc-client-store";

const { trpcClient } = useTRPCClientStore();

const { isLoading, data: players } = useQuery({
	queryKey: ["players"],
	async queryFn() {
		return trpcClient.players.query();
	}
});
</script>

<template>
	<span v-if="isLoading" class="loading loading-spinner loading-md"></span>

	<form
		v-if="isNonEmptyArray(players)"
		@submit.prevent=""
		class="bg-neutral col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl py-8 sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10"
	>
		<fieldset
			class="fieldset col-span-full mx-6 grid grid-cols-subgrid items-center gap-2 lg:col-start-2 lg:col-end-6"
		>
			<legend class="fieldset-legend">Team 1</legend>

			<SelectPlayer :player-number="1" :players="players" />

			<SelectPlayer :player-number="2" :players="players" />
		</fieldset>

		<fieldset
			class="fieldset col-span-full mx-6 mb-8 grid grid-cols-subgrid items-center gap-2 lg:col-start-2 lg:col-end-6"
		>
			<legend class="fieldset-legend">Team 2</legend>

			<SelectPlayer :player-number="3" :players="players" />

			<SelectPlayer :player-number="4" :players="players" />
		</fieldset>

		<div class="col-span-full justify-self-center">
			<button type="submit" class="btn btn-primary">Spiel starten</button>
		</div>
	</form>
</template>
