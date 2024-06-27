import { test, expect } from "vitest";
import { availableGamePoints } from "../game-points";

test("availableGamePoints defines 4 available game points", () => {
	expect(availableGamePoints).toEqual([0, 2, 3, 4]);
});
