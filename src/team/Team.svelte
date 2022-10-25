<script lang="ts">
	import { UsersIcon } from "svelte-feather-icons";
	import { teams } from "./teams-store";

	export let teamNumber: number;

	let teamName = $teams.get(teamNumber)?.teamName ?? "";

	$: teams.update((teams) => {
		return teams.set(teamNumber, {
			teamName,
			gamePoints: 0
		});
	});
</script>

<label class="flex items-center">
	<UsersIcon size="40" class="rounded-l-lg bg-sky-700 p-2" />

	<input
		type="text"
		name="team-{teamNumber}"
		placeholder="Team {teamNumber}"
		bind:value={teamName}
		class="bg-slate-300 text-gray-900 w-60 rounded-r-lg p-2 focus-visible:outline-none"
	/>
</label>
