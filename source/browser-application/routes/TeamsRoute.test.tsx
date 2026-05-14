import { describe, it, expect } from "vitest";
import { render, screen, type RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { ApplicationContextProvider } from "../context/app-context.js";
import { testApplicationContext } from "../test-support/app-context.js";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";
import { createTRPCClient } from "../trpc/client.js";
import { TeamsRoute } from "./TeamsRoute.js";

function renderTeamsRoute(): RenderResult {
	const trpcClient = createTRPCClient({ isRunningInProduction: false });
	const queryClient = new QueryClient();
	const trpc = createTRPCOptionsProxy<TRPCApplicationRouter>({ client: trpcClient, queryClient });

	return render(
		<QueryClientProvider client={queryClient}>
			<ApplicationContextProvider applicationContext={{ ...testApplicationContext, trpc }}>
				<MemoryRouter>
					<TeamsRoute />
				</MemoryRouter>
			</ApplicationContextProvider>
		</QueryClientProvider>
	);
}

describe("<TeamsRoute />", () => {
	it("renders Team 1 label", () => {
		renderTeamsRoute();

		expect(screen.getByText("Team 1")).toBeDefined();
	});

	it("renders Team 2 label", () => {
		renderTeamsRoute();

		expect(screen.getByText("Team 2")).toBeDefined();
	});

	it("renders submit button", () => {
		renderTeamsRoute();

		expect(screen.getByRole("button", { name: "Spiel starten" })).toBeDefined();
	});
});
