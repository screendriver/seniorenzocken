import { describe, it, expect } from "vitest";
import { isStretched } from "./stretched.js";

describe("isStretched()", () => {
	it("returns false when given match total game points equals 0", () => {
		expect(isStretched(0)).toBe(false);
	});

	it("returns false when given match total game points equals 11", () => {
		expect(isStretched(11)).toBe(false);
	});

	it("returns true when given match total game points equals 12", () => {
		expect(isStretched(12)).toBe(true);
	});

	it("returns true when given match total game points is greater than 12", () => {
		expect(isStretched(13)).toBe(true);
	});
});
