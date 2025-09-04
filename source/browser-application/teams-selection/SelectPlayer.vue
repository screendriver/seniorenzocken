<script setup lang="ts">
import type { Players } from "../../server-shared/player.js";

const { playerNumber, players } = defineProps<{
	readonly playerNumber: number;
	readonly players: Players;
}>();

const selectedPlayerId = defineModel<number>({ required: true });
</script>

<template>
	<select v-model="selectedPlayerId" class="select w-full">
		<option disabled :value="-1">Spieler {{ playerNumber }}</option>

		<option v-for="player in players" :key="player.playerId" :value="player.playerId">
			{{ player.nickname }} ({{ player.firstName }})
		</option>
	</select>
</template>
