<script lang="ts">
	import { UsersIcon } from "svelte-feather-icons";
	import type { Team } from "../game-store/team.js";
	import { gameStore } from "../game-store/game-store.js";

	export let team: Team;
	export let enabled: boolean;

	const availableGamePoints = [0, 2, 3, 4] as const;

	function setGamePoint(changeEvent: Event): void {
		const currentTarget = changeEvent.currentTarget as HTMLInputElement;
		const gamePoint = parseInt(currentTarget.value, 10);

		gameStore.setCurrentGamePoints(team, gamePoint);
	}

	$: teamAreaClassName = `gap-2 items-center mx-3 mt-3 join text-info-content ${
		team.isStretched ? "bg-error" : "bg-info"
	}`;
</script>

<section class="flex w-full flex-col gap-3 rounded-lg bg-slate-600">
	<div class={teamAreaClassName}>
		<UsersIcon size="40" class="join-item p-2" />
		<cite class="join-item flex-grow not-italic">{team.teamName}</cite>
		<mark class="badge join-item badge-accent h-auto self-stretch">
			<span class="countdown">
				<span style={`--value: ${team.totalGamePoints};`} />
			</span>
		</mark>
	</div>
	<div class="join m-3">
		{#each availableGamePoints as availableGamePoint (availableGamePoint)}
			<input
				type="radio"
				disabled={!enabled}
				name={`game-point-${team.teamNumber}`}
				value={availableGamePoint}
				checked={team.currentGamePoints === availableGamePoint}
				aria-label={`${availableGamePoint}`}
				class="btn join-item flex-grow"
				on:change={setGamePoint}
			/>
		{/each}
	</div>
</section>
