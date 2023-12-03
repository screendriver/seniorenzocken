<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import Maybe from "true-myth/maybe";
	import { isWakeLockSupported, releaseWakeLock, requestWakeLock } from "./wake-lock.js";
	import { settingsStore } from "../settings/settings-store.js";

	let wakeLockSentinel: Maybe<WakeLockSentinel> = Maybe.nothing();

	function resetAcquiredWakeLock(): void {
		wakeLockSentinel = Maybe.nothing();
	}

	async function tryToAcquireWakeLock(): Promise<void> {
		if (!$settingsStore.isWakeLockSupported) {
			return;
		}

		const wakeLockAlreadyAcquired = wakeLockSentinel.isJust;

		if (wakeLockAlreadyAcquired) {
			return;
		}

		const requestResult = await requestWakeLock(navigator);

		if (requestResult.isOk) {
			wakeLockSentinel = Maybe.just(requestResult.value);
			requestResult.value.addEventListener("release", resetAcquiredWakeLock);
		}
	}

	async function tryToReleaseWakeLock(): Promise<void> {
		if (wakeLockSentinel.isJust) {
			wakeLockSentinel.value.removeEventListener("release", resetAcquiredWakeLock);
			await releaseWakeLock(wakeLockSentinel.value);
			wakeLockSentinel = Maybe.nothing();
		}
	}

	onMount(() => {
		const wakeLockSupported = isWakeLockSupported(navigator);
		settingsStore.setWakeLockSupported(wakeLockSupported);
	});

	onDestroy(async () => {
		await tryToReleaseWakeLock();
	});

	async function tryToAcquireWakeLockWhenVisible(): Promise<void> {
		if (document.visibilityState === "visible") {
			await tryToAcquireWakeLock();
		}
	}

	$: if ($settingsStore.isWakeLockSupported) {
		if ($settingsStore.keepDisplayTurnedOn) {
			tryToAcquireWakeLockWhenVisible().catch((error) => {
				console.error(error);
			});
		} else {
			tryToReleaseWakeLock().catch((error) => {
				console.error(error);
			});
		}
	}
</script>

<svelte:document on:visibilitychange={tryToAcquireWakeLockWhenVisible} />
