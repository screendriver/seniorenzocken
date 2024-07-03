import { test, expect } from "vitest";

test("isStretched() returns false when given total game points is a negative number", () => {
	expect(isStretched(-1)).toBe(false);
});

test("isStretched() returns false when given total game points equals 0", () => {
	expect(isStretched(0)).toBe(false);
});

test("isStretched() returns false when given total game points equals 11", () => {
	expect(isStretched(11)).toBe(false);
});

test("isStretched() returns true when given total game points equals 12", () => {
	expect(isStretched(12)).toBe(true);
});

test("isStretched() returns true when given total game points is greater than 12", () => {
	expect(isStretched(13)).toBe(true);
});
