import Result from "true-myth/result";
import { assert, test, vi, type Mock } from "vitest";
import { isWakeLockSupported, requestWakeLock } from "./wake-lock";

function createNavigator(request: Mock = vi.fn()): Navigator {
	return {
		wakeLock: { request }
	} as unknown as Navigator;
}

test('isWakeLockSupported() returns false when property "wakeLock" does not exist in navigator', () => {
	const isSupported = isWakeLockSupported({} as unknown as Navigator);

	assert.isFalse(isSupported);
});

test('isWakeLockSupported() returns false when property "wakeLock" exists in navigator but value is undefined', () => {
	const isSupported = isWakeLockSupported({ wakeLock: undefined } as unknown as Navigator);

	assert.isFalse(isSupported);
});

test('isWakeLockSupported() returns true when property "wakeLock" exists in navigator', () => {
	const isSupported = isWakeLockSupported(createNavigator());

	assert.isTrue(isSupported);
});

test("requestWakeLock() returns an Result Err when requesting screen wake lock rejects with an Error", async () => {
	const request = vi.fn().mockRejectedValue(new Error("Test error"));

	const requestResult = await requestWakeLock(createNavigator(request));

	assert.deepStrictEqual(requestResult, Result.err("Test error"));
});

test("requestWakeLock() returns an Result Err when requesting screen wake lock rejects with an a non error object", async () => {
	const request = vi.fn().mockRejectedValue(42);

	const requestResult = await requestWakeLock(createNavigator(request));

	assert.deepStrictEqual(requestResult, Result.err("An unknown error occurred"));
});

test("requestWakeLock() returns an Result Ok when requesting screen wake lock succeeds", async () => {
	const sentinel = {} as unknown as WakeLockSentinel;
	const request = vi.fn().mockResolvedValue(sentinel);

	const requestResult = await requestWakeLock(createNavigator(request));

	assert.deepStrictEqual(requestResult, Result.ok(sentinel));
});
