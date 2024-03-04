<script lang="ts">
	import { assert } from "@sindresorhus/is";
	import ImageKit from "imagekit-javascript";
	import { GithubIcon } from "svelte-feather-icons";
	import Maybe from "true-myth/maybe";
	import TeamsForm from "../lib/team/TeamsForm.svelte";
	import Game from "../lib/game/Game.svelte";
	import GameOver from "../lib/game-over/GameOver.svelte";
	import GamePointAudio from "../lib/audio/GamePointAudio.svelte";
	import { gameStore } from "../lib/game-store/game-store.js";
	import WakeLock from "../lib/screen/WakeLock.svelte";
	import SettingsMenu from "../lib/settings/SettingsMenu.svelte";
	import { page } from "$app/stores";

	const imageKitBaseUrl = import.meta.env.VITE_IMAGEKIT_BASE_URL;
	assert.string(imageKitBaseUrl);

	const apiRouteBaseUrl = Maybe.of(import.meta.env.VITE_API_ROUTE_BASE_URL).mapOr($page.url, (urlString) => {
		return new URL(urlString);
	});

	const imagekit = new ImageKit({
		urlEndpoint: `${imageKitBaseUrl}/seniorenzocken/`,
	});

	const headerImageUrl = imagekit.url({
		path: "watten-karten.jpg",
		transformation: [
			{
				width: "1920",
				height: "192",
				q: "50",
			},
		],
	});
</script>

<svelte:head>
	{#if import.meta.env.MODE === "production"}
		<script
			async={true}
			defer={true}
			data-website-id="919705a2-2dee-42e9-8a2d-e24cbaaee0c1"
			data-do-not-track="true"
			src="https://statistics.echooff.de/tasty.js"
		></script>
	{/if}
</svelte:head>

<WakeLock />

<SettingsMenu />

<header class="hero">
	<img src={headerImageUrl} alt="Karten" class="object-cover h-48 blur-sm" />
</header>

<main class="flex-1">
	{#if $gameStore.gameRunning}
		<Game />
		{#if $gameStore.audioPlaying}
			<GamePointAudio {apiRouteBaseUrl} includeStretched={true} />
		{/if}
	{:else if $gameStore.isGameOver}
		<GameOver {apiRouteBaseUrl} />
	{:else}
		<TeamsForm />
	{/if}
</main>

<footer class="justify-end p-5 footer bg-base-300">
	<a href="https://github.com/screendriver/seniorenzocken" title="GitHub">
		<GithubIcon size="24" class="hover:link-info" />
	</a>
</footer>
