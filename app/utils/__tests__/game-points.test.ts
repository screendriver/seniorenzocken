import { test, expect } from "vitest";

test("availableGamePoints defines 4 available game points", () => {
	expect(availableGamePoints).toStrictEqual([0, 2, 3, 4]);
});
