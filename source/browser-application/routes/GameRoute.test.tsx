import assert from "node:assert";
import { suite, test } from "mocha";
import * as React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";
import { createTRPCClient } from "../trpc/client.js";
import { ApplicationContextProvider } from "../context/app-context.js";
import { testApplicationContext } from "../test-support/app-context.js";
import { getReactTestingLibrary, installReactGlobal } from "../test-support/mocha-jsdom.js";
import { GameRoute, shouldRedirectFromGameRoute } from "./GameRoute.js";

installReactGlobal(React);

async function renderGameRoute(): Promise<void> {
	const trpcClient = createTRPCClient({ isRunningInProduction: false });
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				gcTime: 0
			}
		}
	});
	const trpc = createTRPCOptionsProxy<TRPCApplicationRouter>({ client: trpcClient, queryClient });
	const { render } = await getReactTestingLibrary();

	render(
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

suite("<GameRoute />", function () {
	test("redirects to teams when no game is running", async function () {
		await renderGameRoute();
		const { screen } = await getReactTestingLibrary();

		assert.notStrictEqual(await screen.findByText("Teams page"), undefined);
	});

	test("does not redirect when the game is over", function () {
		const shouldRedirect = shouldRedirectFromGameRoute({
			isGameRunning: false,
			isGameOver: true,
			team1Name: "foo",
			team2Name: "bar"
		});

		assert.strictEqual(shouldRedirect, false);
	});
});
