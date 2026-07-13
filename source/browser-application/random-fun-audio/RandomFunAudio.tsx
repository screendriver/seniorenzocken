import { forwardRef, useEffect, useImperativeHandle, useRef, type RefObject } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "zustand";
import { useApplicationContext, type BrowserRuntime, type TimeoutId } from "../context/app-context.js";

export type RandomFunAudioHandle = {
	readonly playEmptyAudio: () => void;
};

function getRandomDelay(randomFraction: number): number {
	const oneMinuteInMilliseconds = 60_000;
	const twoMinutesInMilliseconds = 2 * oneMinuteInMilliseconds;
	return twoMinutesInMilliseconds + Math.floor(randomFraction * oneMinuteInMilliseconds);
}

type RandomAudioSchedulerInput = {
	readonly audioElementReference: RefObject<HTMLAudioElement | null>;
	readonly browserRuntime: BrowserRuntime;
	readonly isGameRunning: boolean;
	readonly queryRandomFunAudioUrl: () => Promise<string>;
	readonly timeoutReference: TimeoutReference;
};

type TimeoutReference = {
	current: TimeoutId | null;
};

function scheduleRandomAudio(input: RandomAudioSchedulerInput): void {
	const { audioElementReference, browserRuntime, isGameRunning, queryRandomFunAudioUrl, timeoutReference } = input;

	if (!isGameRunning || audioElementReference.current === null) {
		return;
	}

	if (timeoutReference.current !== null) {
		browserRuntime.clearTimeout(timeoutReference.current);
	}

	timeoutReference.current = browserRuntime.setTimeout(() => {
		const playRandomAudio = async (): Promise<void> => {
			const randomFunAudioUrl = await queryRandomFunAudioUrl();
			const audioElement = audioElementReference.current;
			if (audioElement === null) {
				return;
			}
			audioElement.src = randomFunAudioUrl;
			await audioElement.play();
			scheduleRandomAudio(input);
		};

		void playRandomAudio();
	}, getRandomDelay(browserRuntime.getRandomFraction()));
}

export const RandomFunAudio = forwardRef<RandomFunAudioHandle>(
	function RandomFunAudioComponent(_properties, reference) {
		const applicationContext = useApplicationContext();
		const { browserRuntime, gameStore, trpc } = applicationContext;
		const queryClient = useQueryClient();
		const audioElementReference = useRef<HTMLAudioElement>(null);
		const isGameRunning = useStore(gameStore, (state) => {
			return state.isGameRunning;
		});

		useEffect(() => {
			const timeoutReference: TimeoutReference = { current: null };
			const randomAudioSchedulerInput: RandomAudioSchedulerInput = {
				audioElementReference,
				browserRuntime,
				isGameRunning,
				async queryRandomFunAudioUrl() {
					return queryClient.fetchQuery(trpc.audio.getRandomFunAudio.queryOptions());
				},
				timeoutReference
			};

			const onActivity = (): void => {
				scheduleRandomAudio(randomAudioSchedulerInput);
			};
			browserRuntime.addWindowEventListener("keydown", onActivity);
			browserRuntime.addWindowEventListener("mousemove", onActivity);
			browserRuntime.addWindowEventListener("mousedown", onActivity);
			return () => {
				browserRuntime.removeWindowEventListener("keydown", onActivity);
				browserRuntime.removeWindowEventListener("mousemove", onActivity);
				browserRuntime.removeWindowEventListener("mousedown", onActivity);
				const scheduledTimeoutId = randomAudioSchedulerInput.timeoutReference.current;
				if (scheduledTimeoutId !== null) {
					browserRuntime.clearTimeout(scheduledTimeoutId);
				}
			};
		}, [browserRuntime, isGameRunning, queryClient, trpc.audio.getRandomFunAudio]);

		useImperativeHandle(reference, () => {
			return {
				playEmptyAudio() {
					const audioElement = audioElementReference.current;
					if (audioElement === null) {
						return;
					}
					void audioElement.play();
				}
			};
		});

		return (
			<audio
				ref={audioElementReference}
				src="data:audio/mp4;base64,AAAAHGZ0eXBNNEEgAAACAE00QSBpc29taXNvMgAAAAhmcmVlAAAAPW1kYXTeAgBMYXZjNjAuMzEuMTAyAEIgCMEYOCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHCEQBGCMHAAAAxNtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACPXRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAQAAAEAAAAAAbVtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAKxEAAAVOlXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAAFgbWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEkc3RibAAAAGpzdHNkAAAAAAAAAAEAAABabXA0YQAAAAAAAAABAAAAAAAAAAAAAgAQAAAAAKxEAAAAAAA2ZXNkcwAAAAADgICAJQABAASAgIAXQBUAAAAAAfQAAAANcQWAgIAFEhBW5QAGgICAAQIAAAAgc3R0cwAAAAAAAAACAAAABQAABAAAAAABAAABOgAAABxzdHNjAAAAAAAAAAEAAAABAAAABgAAAAEAAAAsc3RzegAAAAAAAAAAAAAABgAAABcAAAAGAAAABgAAAAYAAAAGAAAABgAAABRzdGNvAAAAAAAAAAEAAAAsAAAAGnNncGQBAAAAcm9sbAAAAAIAAAAB//8AAAAcc2JncAAAAAByb2xsAAAAAQAAAAYAAAABAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY2MC4xNi4xMDA="
			/>
		);
	}
);
