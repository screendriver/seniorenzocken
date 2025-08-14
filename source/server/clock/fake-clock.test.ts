import { describe, it, expect } from "vitest";
import { createFakeClock } from "./fake-clock.js";

describe("now()", () => {
	it("returns a fixed date", () => {
		const fakeClock = createFakeClock();

		expect(fakeClock.now).toStrictEqual(new Date("2025-07-24T09:10:20.153Z"));
	});
});
