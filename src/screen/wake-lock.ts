export function isWakeLockSupported(navigator: Navigator): boolean {
	return "wakeLock" in navigator;
}
