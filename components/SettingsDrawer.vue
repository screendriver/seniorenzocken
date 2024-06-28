<script setup lang="ts">
import { FeMenu as MenuIcon } from "@kalimahapps/vue-icons";

const {
	isSupported: isWakeLockSupported,
	isActive: isWakeLockActive,
	request: requestWakeLock,
	release: releaseWakeLock,
} = useWakeLock();
const gameStore = useGameStore();

if (isWakeLockSupported.value) {
	requestWakeLock("screen");
}

function toggleWakeLock(event: Event): void {
	const inputElement = event.target as HTMLInputElement;

	if (inputElement.checked) {
		requestWakeLock("screen");
	} else {
		releaseWakeLock();
	}
}
</script>

<template>
	<div class="drawer-auto-gutter drawer">
		<input id="settings-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content">
			<label for="settings-drawer" class="btn btn-primary drawer-button absolute m-2">
				<MenuIcon class="text-2xl" />
			</label>

			<main
				class="mx-6 grid min-h-screen grid-cols-4 items-center gap-4 md:mx-auto md:grid-cols-8 lg:max-w-7xl lg:grid-cols-12"
			>
				<slot />
			</main>
		</div>

		<aside class="drawer-side">
			<label for="settings-drawer" aria-label="Close sidebar" class="drawer-overlay"></label>
			<menu class="menu min-h-full w-80 bg-base-200 p-4 text-base-content">
				<li class="form-control">
					<label class="label cursor-pointer">
						<span class="label-text">Display aktiv</span>
						<ClientOnly>
							<input
								id="wake-lock"
								:disabled="!isWakeLockSupported"
								:checked="isWakeLockActive"
								type="checkbox"
								class="checkbox"
								@change="toggleWakeLock"
							/>
						</ClientOnly>
					</label>
				</li>
				<li class="form-control">
					<label class="label cursor-pointer">
						<span class="label-text">Punktestand vorlesen</span>
						<input
							id="play-audio"
							:checked="gameStore.shouldPlayAudio"
							type="checkbox"
							class="checkbox"
							@change="gameStore.toggleShouldPlayAudio"
						/>
					</label>
				</li>
			</menu>
		</aside>
	</div>
</template>
