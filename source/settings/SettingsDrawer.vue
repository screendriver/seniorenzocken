<script setup lang="ts">
import { useWakeLock } from "@vueuse/core";
import { FeMenu as MenuIcon } from "@kalimahapps/vue-icons";
import { useGameStore } from "../game-store/game-store";

const { isSupported: isWakeLockSupported, isActive: isWakeLockActive, request: requestWakeLock } = useWakeLock();
const gameStore = useGameStore();

function activateWakeLock(): void {
	if (isWakeLockSupported.value && !isWakeLockActive.value) {
		void requestWakeLock("screen");
	}
}
</script>

<template>
	<div @click.once="activateWakeLock" class="drawer-auto-gutter drawer">
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
			<menu class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
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
