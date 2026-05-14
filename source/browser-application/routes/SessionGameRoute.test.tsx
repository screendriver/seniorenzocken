import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";
import { ApplicationContextProvider } from "../context/app-context.js";
import { testApplicationContext } from "../test-support/app-context.js";
import { SessionGameRoute } from "./SessionGameRoute.js";

type FakeSessionGameRouteTrpcClientOptions = {
	readonly currentGameRoundQuery?: () => Promise<unknown>;
};

function createFakeTRPCClient(options: FakeSessionGameRouteTrpcClientOptions = {}): TRPCClient<TRPCApplicationRouter> {
	const { currentGameRoundQuery } = options;

	return {
		session: {
			currentGameRound: {
				query:
					currentGameRoundQuery ??
					vi.fn().mockResolvedValue({
						teams: [{ teamId: 1, name: "One", gamePoints: 0 }],
						gamePointsPerRound: [0, 2],
						hasPreviousGameRounds: false,
						isGameOver: false
					})
			},
			nextGameRound: { mutate: vi.fn().mockResolvedValue(undefined) },
			previousGameRound: { mutate: vi.fn().mockResolvedValue(undefined) }
		}
	} as unknown as TRPCClient<TRPCApplicationRouter>;
}

describe("<SessionGameRoute />", () => {
	it("renders headings for teams", async () => {
		const trpcClient = createFakeTRPCClient();
		const queryClient = new QueryClient();
		const trpc = createTRPCOptionsProxy<TRPCApplicationRouter>({ client: trpcClient, queryClient });
		render(
			<QueryClientProvider client={queryClient}>
				<ApplicationContextProvider applicationContext={{ ...testApplicationContext, trpc }}>
					<MemoryRouter>
						<SessionGameRoute />
					</MemoryRouter>
				</ApplicationContextProvider>
			</QueryClientProvider>
		);

		await expect(screen.findByText("One")).resolves.toBeDefined();
	});

	it("renders an explicit error state when loading the game round fails", async () => {
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
		const trpc = createTRPCOptionsProxy<TRPCApplicationRouter>({ client: trpcClient, queryClient });

		render(
			<QueryClientProvider client={queryClient}>
				<ApplicationContextProvider applicationContext={{ ...testApplicationContext, trpc }}>
					<MemoryRouter>
						<SessionGameRoute />
					</MemoryRouter>
				</ApplicationContextProvider>
			</QueryClientProvider>
		);

		await expect(screen.findByText("Spielstand konnte nicht geladen werden")).resolves.toBeDefined();
	});
});
