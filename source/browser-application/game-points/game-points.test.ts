import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { isNothing } from "true-myth/maybe";
import { useGamePoints } from "./game-points.js";

describe("useGamePoints()", () => {
	it("returns empty selected game points by default", () => {
		const { result } = renderHook(useGamePoints);

		expect(result.current.selectedGamePoints).toStrictEqual({});
	});

	it("disables previous game round by default", () => {
		const { result } = renderHook(useGamePoints);

		expect(result.current.isPreviousGameRoundEnabled).toBe(false);
	});

	it("returns Nothing when no game point is selected", () => {
		const { result } = renderHook(useGamePoints);

		expect(isNothing(result.current.selectedGamePoint)).toBe(true);
	});

	it("enables game points by default", () => {
		const { result } = renderHook(useGamePoints);

		expect(result.current.isGamePointEnabled(0)).toBe(true);
	});

	it("disables next game round when all selected game points are below the minimum", () => {
		const { result } = renderHook(useGamePoints);

		expect(result.current.isNextGameRoundEnabled).toBe(false);
	});

	it("enables next game round when a team has selected at least two game points", () => {
		const { result } = renderHook(useGamePoints);

		act(() => {
			result.current.setSelectedGamePoints({ 1: 2 });
		});

		expect(result.current.isNextGameRoundEnabled).toBe(true);
	});
});
