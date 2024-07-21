<script setup lang="ts">
const gameStore = useGameStore();

const { team1, team1GamePoint, team2, team2GamePoint, isPreviousGameRoundEnabled, isNextGameRoundEnabled } =
	storeToRefs(gameStore);
</script>

<template>
	<form class="col-span-full mx-4 my-8 grid grid-cols-subgrid lg:col-start-2 lg:col-end-6">
		<fieldset class="col-span-full flex flex-col gap-4">
			<GamePoint
				v-model:game-point="team1GamePoint"
				:team="team1"
				:enabled="gameStore.isGamePointEnabled(team1GamePoint)"
			/>
			<GamePoint
				v-model:game-point="team2GamePoint"
				:team="team2"
				:enabled="gameStore.isGamePointEnabled(team2GamePoint)"
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
