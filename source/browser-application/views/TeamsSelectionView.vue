<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery, useMutation } from "@tanstack/vue-query";
import { isNonEmptyArray } from "@sindresorhus/is";
import SelectPlayer from "../teams-selection/SelectPlayer.vue";
import { useTRPCClientStore } from "../trpc-client-store/trpc-client-store";
import { areSelectedPlayerIdsValid } from "../teams-selection/selected-player-ids";

const { trpcClient } = useTRPCClientStore();

const selectedPlayer1Id = ref(-1);
const selectedPlayer2Id = ref(-1);
const selectedPlayer3Id = ref(-1);
const selectedPlayer4Id = ref(-1);

const { mutate: startGame, isPending: isMutationPending } = useMutation({
	async mutationFn() {
		return trpcClient.protectedGame.start.mutate({
			team1Player1Id: selectedPlayer1Id.value,
			team1Player2Id: selectedPlayer2Id.value,
			team2Player1Id: selectedPlayer3Id.value,
			team2Player2Id: selectedPlayer4Id.value
		});
	}
});

const submitButtonClass = computed(() => {
	const selectedPlayerIds = [
		selectedPlayer1Id.value,
		selectedPlayer2Id.value,
		selectedPlayer3Id.value,
		selectedPlayer4Id.value
	];
	const enabled = areSelectedPlayerIdsValid(selectedPlayerIds) && !isMutationPending.value;

	return {
		btn: true,
		"btn-primary": true,
		"btn-disabled": !enabled
	};
});

const { isLoading, data: players } = useQuery({
	queryKey: ["players"],
	async queryFn() {
		return trpcClient.players.query();
	},
	placeholderData: []
});
</script>

<template>
	<span v-if="isLoading" class="loading loading-spinner loading-md"></span>

	<form
		v-if="isNonEmptyArray(players)"
		@submit.prevent="startGame()"
		class="bg-neutral col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl py-8 sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10"
	>
		<fieldset class="fieldset col-span-full mx-6 grid items-center gap-2 lg:col-start-2 lg:col-end-6">
			<legend class="fieldset-legend">Team 1</legend>

			<SelectPlayer :player-number="1" :players="players" v-model="selectedPlayer1Id" />

			<SelectPlayer :player-number="2" :players="players" v-model="selectedPlayer2Id" />
		</fieldset>

		<fieldset class="fieldset col-span-full mx-6 mb-8 grid items-center gap-2 lg:col-start-2 lg:col-end-6">
			<legend class="fieldset-legend">Team 2</legend>

			<SelectPlayer :player-number="3" :players="players" v-model="selectedPlayer3Id" />

			<SelectPlayer :player-number="4" :players="players" v-model="selectedPlayer4Id" />
		</fieldset>

		<div class="col-span-full justify-self-center">
			<button type="submit" :class="submitButtonClass">Spiel starten</button>
		</div>
	</form>
</template>
