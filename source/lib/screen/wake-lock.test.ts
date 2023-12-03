import test from "ava";
import { fake } from "sinon";
import type { SinonSpy } from "sinon";
import { Result } from "true-myth";
import { isWakeLockSupported, releaseWakeLock, requestWakeLock } from "./wake-lock.js";

function createNavigator(request: SinonSpy<readonly WakeLockType[], Promise<WakeLockSentinel>> = fake()): Navigator {
	return {
		wakeLock: { request },
	} as unknown as Navigator;
}

test('isWakeLockSupported() returns false when property "wakeLock" does not exist in navigator', (t) => {
	const isSupported = isWakeLockSupported({} as unknown as Navigator);

	t.is(isSupported, false);
});

test('isWakeLockSupported() returns true when property "wakeLock" exists in navigator', (t) => {
	const isSupported = isWakeLockSupported(createNavigator());

	t.is(isSupported, true);
});

test("requestWakeLock() returns an Result Err when requesting screen wake lock rejects with an Error", async (t) => {
	const request: SinonSpy<readonly WakeLockType[], Promise<WakeLockSentinel>> = fake.rejects(new Error("Test error"));

	const requestResult = await requestWakeLock(createNavigator(request));

	t.deepEqual(requestResult, Result.err("Test error"));
});

test("requestWakeLock() returns an Result Err when requesting screen wake lock rejects with an a non error object", async (t) => {
	const request: SinonSpy<readonly WakeLockType[], Promise<WakeLockSentinel>> = fake(() => {
		throw 42;
	});

	const requestResult = await requestWakeLock(createNavigator(request));

	t.deepEqual(requestResult, Result.err("An unknown error occurred"));
});

test("requestWakeLock() returns an Result Ok when requesting screen wake lock succeeds", async (t) => {
	const sentinel = {} as unknown as WakeLockSentinel;
	const request: SinonSpy<readonly WakeLockType[], Promise<WakeLockSentinel>> = fake.resolves(sentinel);

	const requestResult = await requestWakeLock(createNavigator(request));

	t.deepEqual(requestResult, Result.ok(sentinel));
});

test("releaseWakeLock() calls release() on given wake lock sentinel", (t) => {
	const release = fake();
	const wakeLockSentinel = { release } as unknown as WakeLockSentinel;

	releaseWakeLock(wakeLockSentinel);

	t.is(release.callCount, 1);
});
