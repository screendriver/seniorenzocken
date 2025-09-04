import { describe, it, expect } from "vitest";
import { areSelectedPlayerIdsValid } from "./selected-player-ids.js";

describe("areSelectedPlayerIdsValid()", () => {
	it("returns false when given selected player ids is an empty Array", () => {
		expect(areSelectedPlayerIdsValid([])).toBe(false);
	});

	it("returns false when not every selected player has an id", () => {
		expect(areSelectedPlayerIdsValid([1, 2, -1, 4])).toBe(false);
	});

	it("returns false when multiple selected players have the same id", () => {
		expect(areSelectedPlayerIdsValid([1, 2, 3, 1])).toBe(false);
	});

	it("returns true when all selected players have a different id", () => {
		expect(areSelectedPlayerIdsValid([1, 2, 3, 4])).toBe(true);
	});
});
