<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import GamePointAudio from "./GamePointAudio.svelte";
	import type { Teams } from "../team/team-schema";

	export let teams: Teams;

	let audioElement: HTMLAudioElement;

	const dispatch = createEventDispatcher<{ audioended: void }>();

	function dispatchAudioEndedEvent(): void {
		dispatch("audioended");
	}

	function playWinSound(): void {
		audioElement.play();
	}
</script>

<GamePointAudio {teams} includeStretched={false} on:audioended={playWinSound} />

<audio bind:this={audioElement} on:ended={dispatchAudioEndedEvent}>
	<source src="/audio/gwonnen.webm" type="audio/webm" />
	<source src="/audio/gwonnen.aac" type="audio/aac" />
</audio>
