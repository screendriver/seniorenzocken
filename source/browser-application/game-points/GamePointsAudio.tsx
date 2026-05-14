import { useEffect, type FunctionComponent } from "react";
import { useStore } from "zustand";
import { isUndefined } from "@sindresorhus/is";
import { useApplicationContext, type BrowserRuntime, type AudioElementFactory } from "../context/app-context.js";

function createAudioElements(
	playlistItemApiPaths: readonly string[],
	audioElementFactory: AudioElementFactory
): HTMLAudioElement[] {
	return playlistItemApiPaths.map((playlistItemApiPath) => {
		return audioElementFactory.createAudioElement(playlistItemApiPath);
	});
}

async function waitForAudioToEnd(audioElement: HTMLAudioElement, browserRuntime: BrowserRuntime): Promise<boolean> {
	return new Promise((resolve) => {
		audioElement.addEventListener(
			"error",
			() => {
				resolve(false);
			},
			{ once: true }
		);
		audioElement.addEventListener(
			"waiting",
			() => {
				if (!browserRuntime.isOnline()) {
					resolve(false);
				}
			},
			{ once: true }
		);
		audioElement.addEventListener(
			"ended",
			() => {
				resolve(true);
			},
			{ once: true }
		);
	});
}

async function playAudioElement(audioElement: HTMLAudioElement, browserRuntime: BrowserRuntime): Promise<boolean> {
	const audioEnded = waitForAudioToEnd(audioElement, browserRuntime);
	await audioElement.play();
	return audioEnded;
}

export const GamePointsAudio: FunctionComponent = () => {
	const applicationContext = useApplicationContext();
	const { browserRuntime, audioElementFactory, gameStore } = applicationContext;
	const isAudioPlaying = useStore(gameStore, (state) => {
		return state.isAudioPlaying;
	});

	useEffect(() => {
		let isCancelled = false;

		async function playAudio(): Promise<void> {
			const audioPlaylist = await gameStore.getState().generateGamePointsAudioPlaylist();
			const audioObjects = audioPlaylist.match({
				Ok(playlistItemApiPaths) {
					return createAudioElements(playlistItemApiPaths, audioElementFactory);
				},
				Err() {
					return [];
				}
			});

			let currentAudioIndex = 0;

			while (currentAudioIndex < audioObjects.length) {
				if (isCancelled) {
					return;
				}

				const currentAudio = audioObjects[currentAudioIndex];
				if (isUndefined(currentAudio)) {
					return;
				}

				const playedSuccessfully = await playAudioElement(currentAudio, browserRuntime);
				if (!playedSuccessfully) {
					gameStore.getState().setIsAudioPlaying(false);
					return;
				}

				currentAudioIndex += 1;
			}

			gameStore.getState().setIsAudioPlaying(false);
		}

		if (isAudioPlaying) {
			void playAudio();
		}

		return () => {
			isCancelled = true;
		};
	}, [audioElementFactory, browserRuntime, gameStore, isAudioPlaying]);

	return <audio />;
};
