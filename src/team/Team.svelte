<script lang="ts">
	import { UsersIcon } from "svelte-feather-icons";
	import { teamsStore } from "./teams-store";

	export let teamNumber: number;

	const inputId = `team-${teamNumber}`;
	let teamName = $teamsStore.get(teamNumber)?.teamName ?? "";

	$: teamsStore.update((teams) => {
		return teams.set(teamNumber, {
			teamName,
			teamNumber
		});
	});
</script>

<label for={inputId} class="flex items-center">
	<UsersIcon size="40" class="rounded-l-lg bg-sky-700 p-2" />

	<input
		type="text"
		name={inputId}
		id={inputId}
		placeholder="Team {teamNumber}"
		bind:value={teamName}
		class="bg-slate-300 text-gray-900 w-60 rounded-r-lg p-2 focus-visible:outline-none"
	/>
</label>
