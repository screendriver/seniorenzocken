import { describe, it, expect } from "vitest";
import { cookieName } from "./cookie-name.js";

describe("cookieName", () => {
	it("has the correct name", () => {
		expect(cookieName).toBe("seniorenzocken.session_token");
	});
});
