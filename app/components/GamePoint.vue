<script setup lang="ts">
import { FeUsers as UsersIcon } from "@kalimahapps/vue-icons";

const { team, enabled } = defineProps<{
	team: Team;
	enabled: boolean;
}>();

const gamePoint = defineModel<GamePoint>("gamePoint", { required: true });

function updateGamePoint(newGamePointValue: GamePoint): void {
	gamePoint.value = newGamePointValue;
}

const teamAreaClassName = computed(() => {
	return `gap-2 items-center mx-3 mt-3 join text-info-content ${team.isStretched ? "bg-error" : "bg-info"}`;
});
</script>

<template>
	<section class="flex flex-col gap-3 rounded-lg bg-slate-600">
		<div :class="teamAreaClassName">
			<UsersIcon size="40" class="join-item p-2" />
			<cite class="join-item flex-grow not-italic">{{ team.teamName }}</cite>
			<mark class="badge join-item badge-accent h-auto self-stretch">
				<span class="countdown">
					<span :style="{ '--value': team.gamePoints }" />
				</span>
			</mark>
		</div>
		<div class="join m-3">
			<input
				v-for="availableGamePoint in availableGamePoints"
				type="radio"
				:value="availableGamePoint.toString()"
				:checked="gamePoint === availableGamePoint"
				:disabled="!enabled"
				:name="`${team.teamName}-${availableGamePoint}`"
				:aria-label="availableGamePoint.toString()"
				:key="`${team.teamName}-${availableGamePoint}`"
				@click="updateGamePoint(availableGamePoint)"
				class="btn join-item flex-grow"
			/>
		</div>
	</section>
</template>
