import { Result } from "true-myth";
import is from "@sindresorhus/is";

export function isWakeLockSupported(navigator: Navigator): boolean {
	return "wakeLock" in navigator;
}

export async function requestWakeLock(navigator: Navigator): Promise<Result<WakeLockSentinel, string>> {
	try {
		const wakeLock = await navigator.wakeLock.request("screen");

		return Result.ok(wakeLock);
	} catch (error) {
		if (is.error(error)) {
			return Result.err(error.message);
		}

		return Result.err("An unknown error occurred");
	}
}

export function releaseWakeLock(wakeLockSentinel: WakeLockSentinel): Promise<void> {
	return wakeLockSentinel.release();
}
