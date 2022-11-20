<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from "svelte";
	import Maybe from "true-myth/maybe";
	import sample from "lodash.sample";
	import type { Teams } from "../team/team-schema.js";
	import { createPlaylist } from "./playlist.js";

	export let teams: Teams;

	let audioElement: HTMLAudioElement;
	let sourceElementWebm: HTMLSourceElement;
	let sourceElementAac: HTMLSourceElement;

	const listToPlay = createPlaylist(teams, sample);
	let indexToPlay = 0;

	const dispatch = createEventDispatcher<{ audioended: void }>();

	function playAudio(source: Maybe<string>): void {
		if (source.isNothing) {
			return;
		}

		sourceElementWebm.src = `${source.value}.webm`;
		sourceElementAac.src = `${source.value}.aac`;
		audioElement.load();
		audioElement.play();
	}

	function endedEventListener() {
		function hasReachedListToPlayEnd(): boolean {
			return indexToPlay === listToPlay.length - 1;
		}

		if (hasReachedListToPlayEnd()) {
			dispatch("audioended");
			return;
		}

		indexToPlay = indexToPlay + 1;
		playAudio(Maybe.of(listToPlay[indexToPlay]));
	}

	onMount(() => {
		audioElement.addEventListener("ended", endedEventListener);

		playAudio(Maybe.of(listToPlay[indexToPlay]));
	});

	onDestroy(() => {
		audioElement.removeEventListener("ended", endedEventListener);
	});
</script>

<audio bind:this={audioElement}>
	<source bind:this={sourceElementWebm} type="audio/webm" />
	<source bind:this={sourceElementAac} type="audio/aac" />
</audio>
