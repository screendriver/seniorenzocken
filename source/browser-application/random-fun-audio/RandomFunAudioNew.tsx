import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApplicationContext, type TimeoutId } from "../context/app-context.js";

export type RandomFunAudioNewHandle = {
	readonly playEmptyAudio: () => void;
};

function getRandomDelay(randomFraction: number): number {
	const oneMinuteInMilliseconds = 60_000;
	const twoMinutesInMilliseconds = 2 * oneMinuteInMilliseconds;
	return twoMinutesInMilliseconds + Math.floor(randomFraction * oneMinuteInMilliseconds);
}

export const RandomFunAudioNew = forwardRef<RandomFunAudioNewHandle>(
	function RandomFunAudioNewComponent(_properties, reference) {
		const applicationContext = useApplicationContext();
		const { browserRuntime, trpc } = applicationContext;
		const queryClient = useQueryClient();
		const [emptyAudioAlreadyPlayed, setEmptyAudioAlreadyPlayed] = useState(false);
		const [playRandomFunAudio, setPlayRandomFunAudio] = useState(false);
		const audioElementReference = useRef<HTMLAudioElement>(null);
		const timeoutReference = useRef<TimeoutId | null>(null);

		const restartTimer = useCallback((): void => {
			if (audioElementReference.current === null || !emptyAudioAlreadyPlayed) {
				return;
			}
			if (timeoutReference.current !== null) {
				browserRuntime.clearTimeout(timeoutReference.current);
			}
			timeoutReference.current = browserRuntime.setTimeout(() => {
				setPlayRandomFunAudio(true);
			}, getRandomDelay(browserRuntime.getRandomFraction()));
		}, [browserRuntime, emptyAudioAlreadyPlayed]);

		useEffect(() => {
			const onActivity = (): void => {
				restartTimer();
			};
			browserRuntime.addWindowEventListener("keydown", onActivity);
			browserRuntime.addWindowEventListener("mousemove", onActivity);
			browserRuntime.addWindowEventListener("mousedown", onActivity);
			return () => {
				browserRuntime.removeWindowEventListener("keydown", onActivity);
				browserRuntime.removeWindowEventListener("mousemove", onActivity);
				browserRuntime.removeWindowEventListener("mousedown", onActivity);
			};
		}, [browserRuntime, restartTimer]);

		useEffect(() => {
			const playRandomAudio = async (): Promise<void> => {
				if (!playRandomFunAudio || audioElementReference.current === null) {
					return;
				}

				const randomFunAudioUrl = await queryClient.fetchQuery(trpc.audio.getRandomFunAudio.queryOptions());
				const audioElement = audioElementReference.current;
				audioElement.src = randomFunAudioUrl;
				await audioElement.play();
				setPlayRandomFunAudio(false);
				restartTimer();
			};
			void playRandomAudio();
		}, [playRandomFunAudio, queryClient, restartTimer, trpc.audio.getRandomFunAudio]);

		useImperativeHandle(reference, () => {
			return {
				playEmptyAudio() {
					const audioElement = audioElementReference.current;
					if (audioElement === null) {
						return;
					}
					const playEmptyAudio = async (): Promise<void> => {
						await audioElement.play();
						setEmptyAudioAlreadyPlayed(true);
						restartTimer();
					};

					void playEmptyAudio();
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
