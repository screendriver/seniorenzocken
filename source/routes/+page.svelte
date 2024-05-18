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
	const mediaAssetsRouteBaseUrl = Maybe.of(import.meta.env.VITE_MEDIA_ASSETS_BASE_URL).mapOr(
		$page.url,
		(urlString) => {
			return new URL(urlString);
		},
	);

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

<WakeLock />

<SettingsMenu />

<header class="hero">
	<img src={headerImageUrl} alt="Karten" class="h-48 object-cover blur-sm" />
</header>

<main class="flex-1">
	{#if $gameStore.gameRunning}
		<Game />
		{#if $gameStore.audioPlaying}
			<GamePointAudio {apiRouteBaseUrl} includeStretched={true} />
		{/if}
	{:else if $gameStore.isGameOver}
		<GameOver {apiRouteBaseUrl} {mediaAssetsRouteBaseUrl} />
	{:else}
		<TeamsForm />
	{/if}
</main>

<footer class="footer justify-end bg-base-300 p-5">
	<a href="https://github.com/screendriver/seniorenzocken" title="GitHub">
		<GithubIcon size="24" class="hover:link-info" />
	</a>
</footer>
