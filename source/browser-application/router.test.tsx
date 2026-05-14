import { describe, it, expect } from "vitest";
import { redirectAuthenticatedSessionFromSignIn, redirectUnauthenticatedSession } from "./router.js";

describe("redirectUnauthenticatedSession()", () => {
	it("redirects to teams when there is no session token", () => {
		const redirectResponse = redirectUnauthenticatedSession(null);

		expect(redirectResponse).toBeInstanceOf(Response);
		expect(redirectResponse?.headers.get("Location")).toBe("/teams");
	});

	it("does not redirect when there is a session token", () => {
		const redirectResponse = redirectUnauthenticatedSession("session-token");

		expect(redirectResponse).toBeNull();
	});
});

describe("redirectAuthenticatedSessionFromSignIn()", () => {
	it("redirects to teams selection when there is a session token", () => {
		const redirectResponse = redirectAuthenticatedSessionFromSignIn("session-token");

		expect(redirectResponse).toBeInstanceOf(Response);
		expect(redirectResponse?.headers.get("Location")).toBe("/teams-selection");
	});

	it("does not redirect when there is no session token", () => {
		const redirectResponse = redirectAuthenticatedSessionFromSignIn(null);

		expect(redirectResponse).toBeNull();
	});
});
