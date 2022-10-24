<script lang="ts">
	import Maybe from "true-myth/maybe";
	import CancelGame from "./CancelGame.svelte";
	import GamePoint, { type GamePointChangeEvent } from "./GamePoint.svelte";
	import { teams } from "../team/teams-store";

	let teamNumberEnabled: Maybe<number> = Maybe.nothing();

	function disableGamePoint(event: CustomEvent<GamePointChangeEvent>): void {
		const { teamNumber, team, gamePoint } = event.detail;

		teamNumberEnabled = gamePoint === 0 ? Maybe.nothing() : Maybe.just(teamNumber);

		teams.update((teamsMap) => {
			return teamsMap.set(teamNumber, {
				teamName: team.teamName,
				gamePoints: Maybe.just(gamePoint)
			});
		});
	}
</script>

<form
	class="relative top-16 m-10 p-8 bg-slate-800 bg-opacity-90 rounded-lg shadow-md flex flex-col items-center gap-6 sm:max-w-lg sm:mx-auto"
>
	{#each Array.from($teams.entries()) as [teamNumber, team]}
		{@const disabled = teamNumberEnabled.mapOr(false, (teamNumberEnabledValue) => {
			return teamNumberEnabledValue !== teamNumber;
		})}

		<GamePoint {teamNumber} {team} {disabled} on:gamepointchange={disableGamePoint} />
	{/each}

	<CancelGame />
</form>
