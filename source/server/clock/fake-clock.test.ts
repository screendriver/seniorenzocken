import { suite, test, expect } from "vitest";
import { createFakeClock } from "./fake-clock.ts";

suite("fake-clock", () => {
	test("now() returns a fixed date", () => {
		const fakeClock = createFakeClock();

		expect(fakeClock.now).toEqual(new Date("2025-07-24T09:10:20.153Z"));
	});
});
