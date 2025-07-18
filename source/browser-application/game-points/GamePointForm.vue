<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useGameStore } from "../game-store/game-store.ts";
import GamePoint from "./GamePoint.vue";

const gameStore = useGameStore();

const { team1, team2, isPreviousGameRoundEnabled, isNextGameRoundEnabled } = storeToRefs(gameStore);
</script>

<template>
	<form class="col-span-full mx-4 my-8 grid grid-cols-subgrid lg:col-start-2 lg:col-end-6">
		<fieldset class="col-span-full flex flex-col gap-4">
			<GamePoint
				v-model:game-point="team1.currentRoundGamePoints"
				:team="team1"
				:enabled="gameStore.isGamePointEnabled(team1.currentRoundGamePoints)"
			/>
			<GamePoint
				v-model:game-point="team2.currentRoundGamePoints"
				:team="team2"
				:enabled="gameStore.isGamePointEnabled(team2.currentRoundGamePoints)"
			/>

			<div class="join self-center">
				<button
					:disabled="!isPreviousGameRoundEnabled"
					type="button"
					class="btn btn-primary join-item"
					@click="gameStore.previousGameRound"
				>
					Runde zurück
				</button>

				<button
					:disabled="!isNextGameRoundEnabled"
					type="button"
					class="btn btn-primary join-item"
					@click="gameStore.nextGameRound"
				>
					Nächste Runde
				</button>
			</div>
		</fieldset>
	</form>
</template>
