<script lang="ts">
	import GamePointAudio from "./GamePointAudio.svelte";
	import type { Teams } from "../team/team-schema";

	export let teams: Teams;

	let audioElement: HTMLAudioElement;

	function playWinSound(): void {
		audioElement.play();
	}
</script>

<GamePointAudio {teams} includeStretched={false} on:audioended={playWinSound} />

<audio bind:this={audioElement}>
	<source src="/audio/gwonnen.webm" type="audio/webm" />
	<source src="/audio/gwonnen.aac" type="audio/aac" />
</audio>
