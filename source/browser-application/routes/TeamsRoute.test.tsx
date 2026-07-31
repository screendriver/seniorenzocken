import assert from "node:assert";
import { suite, test } from "mocha";
import * as React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { ApplicationContextProvider } from "../context/app-context.js";
import { testApplicationContext } from "../test-support/app-context.js";
import { getReactTestingLibrary, installReactGlobal } from "../test-support/mocha-jsdom.js";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";
import { createTRPCClient } from "../trpc/client.js";
import { TeamsRoute } from "./TeamsRoute.js";

installReactGlobal(React);

async function renderTeamsRoute(): Promise<void> {
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
				<MemoryRouter>
					<TeamsRoute />
				</MemoryRouter>
			</ApplicationContextProvider>
		</QueryClientProvider>
	);
}

suite("<TeamsRoute />", function () {
	test("renders Team 1 label", async function () {
		await renderTeamsRoute();
		const { screen } = await getReactTestingLibrary();

		assert.notStrictEqual(screen.getByText("Team 1"), undefined);
	});

	test("renders Team 2 label", async function () {
		await renderTeamsRoute();
		const { screen } = await getReactTestingLibrary();

		assert.notStrictEqual(screen.getByText("Team 2"), undefined);
	});

	test("renders submit button", async function () {
		await renderTeamsRoute();
		const { screen } = await getReactTestingLibrary();

		assert.notStrictEqual(screen.getByRole("button", { name: "Spiel starten" }), undefined);
	});
});
