import { describe, it, expect } from "vitest";
import { render, screen, type RenderResult } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";
import { createTRPCClient } from "../trpc/client.js";
import { ApplicationContextProvider } from "../context/app-context.js";
import { testApplicationContext } from "../test-support/app-context.js";
import { GameRoute, shouldRedirectFromGameRoute } from "./GameRoute.js";

function renderGameRoute(): RenderResult {
	const trpcClient = createTRPCClient({ isRunningInProduction: false });
	const queryClient = new QueryClient();
	const trpc = createTRPCOptionsProxy<TRPCApplicationRouter>({ client: trpcClient, queryClient });

	return render(
		<QueryClientProvider client={queryClient}>
			<ApplicationContextProvider applicationContext={{ ...testApplicationContext, trpc }}>
				<MemoryRouter initialEntries={["/game"]}>
					<Routes>
						<Route path="/game" element={<GameRoute />} />
						<Route path="/teams" element={<div>Teams page</div>} />
					</Routes>
				</MemoryRouter>
			</ApplicationContextProvider>
		</QueryClientProvider>
	);
}

describe("<GameRoute />", () => {
	it("redirects to teams when no game is running", async () => {
		renderGameRoute();

		await expect(screen.findByText("Teams page")).resolves.toBeDefined();
	});

	it("does not redirect when the game is over", () => {
		const shouldRedirect = shouldRedirectFromGameRoute({
			isGameRunning: false,
			isGameOver: true,
			team1Name: "foo",
			team2Name: "bar"
		});

		expect(shouldRedirect).toBe(false);
	});
});
