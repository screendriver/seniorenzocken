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

	$: teamAreaClassName = `gap-2 items-center mx-3 mt-3 join bg-info text-info-content ${
		team.isStretched ? "bg-error" : "bg-info"
	}`;
</script>

<section class="flex flex-col gap-3 w-full rounded-lg bg-slate-600">
	<div class={teamAreaClassName}>
		<UsersIcon size="40" class="p-2 join-item" />
		<cite class="flex-grow not-italic join-item">{team.teamName}</cite>
		<mark class="self-stretch h-auto badge badge-accent join-item">
			<span class="countdown">
				<span style={`--value: ${team.totalGamePoints};`} />
			</span>
		</mark>
	</div>
	<div class="m-3 join">
		{#each availableGamePoints as availableGamePoint (availableGamePoint)}
			<input
				type="radio"
				disabled={!enabled}
				name={`game-point-${team.teamNumber}`}
				value={availableGamePoint}
				checked={team.currentGamePoints === availableGamePoint}
				aria-label={`${availableGamePoint}`}
				class="flex-grow join-item btn"
				on:change={setGamePoint}
			/>
		{/each}
	</div>
</section>
