import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";
import { ApplicationContextProvider } from "../context/app-context.js";
import { testApplicationContext } from "../test-support/app-context.js";
import { GameOverRoute } from "./GameOverRoute.js";

type FakeGameOverTrpcClientOptions = {
	readonly currentGameRoundQuery?: () => Promise<unknown>;
};

function createFakeTRPCClient(options: FakeGameOverTrpcClientOptions = {}): TRPCClient<TRPCApplicationRouter> {
	const { currentGameRoundQuery } = options;

	return {
		session: {
			currentGameRound: {
				query:
					currentGameRoundQuery ??
					vi.fn().mockResolvedValue({
						teams: [{ teamId: 1, name: "One", gamePoints: 15 }],
						gamePointsPerRound: [0, 2, 3, 4],
						hasPreviousGameRounds: true,
						isGameOver: true,
						winnerTeam: { teamId: 1, name: "One", gamePoints: 15 }
					})
			}
		}
	} as unknown as TRPCClient<TRPCApplicationRouter>;
}

function renderGameOverRoute(trpcClient: TRPCClient<TRPCApplicationRouter>, queryClient: QueryClient): void {
	const trpc = createTRPCOptionsProxy<TRPCApplicationRouter>({ client: trpcClient, queryClient });

	render(
		<QueryClientProvider client={queryClient}>
			<ApplicationContextProvider applicationContext={{ ...testApplicationContext, trpc }}>
				<MemoryRouter initialEntries={["/game-over"]}>
					<Routes>
						<Route path="/game-over" element={<GameOverRoute />} />
						<Route path="/teams-selection" element={<div>Teams selection</div>} />
					</Routes>
				</MemoryRouter>
			</ApplicationContextProvider>
		</QueryClientProvider>
	);
}

describe("<GameOverRoute />", () => {
	it("navigates to teams selection when a new game is started", async () => {
		const trpcClient = createFakeTRPCClient();
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false
				}
			}
		});

		renderGameOverRoute(trpcClient, queryClient);

		await userEvent.click(await screen.findByRole("button", { name: "Neues Spiel" }));

		await expect(screen.findByText("Teams selection")).resolves.toBeDefined();
	});

	it("renders an explicit error state when loading the game over screen fails", async () => {
		const trpcClient = createFakeTRPCClient({
			currentGameRoundQuery: vi.fn().mockRejectedValue(new Error("boom"))
		});
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false
				}
			}
		});

		renderGameOverRoute(trpcClient, queryClient);

		await expect(screen.findByText("Spielende konnte nicht geladen werden")).resolves.toBeDefined();
	});
});
