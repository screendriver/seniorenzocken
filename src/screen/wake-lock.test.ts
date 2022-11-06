import { assert, test } from "vitest";
import { isWakeLockSupported } from "./wake-lock";

test('isWakeLockSupported() returns false when property "wakeLock" does not exist in navigator', () => {
	const isSupported = isWakeLockSupported({} as unknown as Navigator);

	assert.isFalse(isSupported);
});

test('isWakeLockSupported() returns true when property "wakeLock" exists in navigator', () => {
	const isSupported = isWakeLockSupported({ wakeLock: {} } as unknown as Navigator);

	assert.isTrue(isSupported);
});
