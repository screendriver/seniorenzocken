<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import is from "@sindresorhus/is";
	import Maybe from "true-myth/maybe";
	import ky from "ky";
	import { consola } from "consola/browser";
	import { gameStore } from "../game-store/game-store.js";

	export let apiRouteBaseUrl: URL;
	export let includeStretched: boolean;

	const dispatch = createEventDispatcher<{ readonly audioEnded: void }>();
	let indexToPlay = 0;
	let listToPlay: readonly URL[] = [];

	let audioElementReference: HTMLAudioElement | undefined;
	let sourceElementAacReference: HTMLSourceElement | undefined;

	async function playAudio(source: Maybe<URL>): Promise<void> {
		if (source.isNothing) {
			return;
		}

		if (is.htmlElement(sourceElementAacReference)) {
			sourceElementAacReference.src = source.value.toString();
		}

		audioElementReference?.load();
		await audioElementReference?.play();
	}

	function endedEventListener(): void {
		const hasReachedListToPlayEnd = indexToPlay === listToPlay.length - 1;

		if (hasReachedListToPlayEnd) {
			gameStore.gamePointsAudioEnded();
			dispatch("audioEnded");
			return;
		}

		const nextIndexToPlay = indexToPlay + 1;
		indexToPlay = nextIndexToPlay;
	}

	onMount(async () => {
		listToPlay = await ky
			.get("api/audio/playlist", {
				prefixUrl: apiRouteBaseUrl,
				searchParams: {
					includeStretched,
					teams: JSON.stringify($gameStore.teams),
				},
			})
			.json();
	});

	$: playAudio(Maybe.of(listToPlay[indexToPlay])).catch((error) => {
		consola.error(error);
	});
</script>

<audio bind:this={audioElementReference} on:ended={endedEventListener}>
	<source bind:this={sourceElementAacReference} type="audio/x-m4a" />
</audio>
