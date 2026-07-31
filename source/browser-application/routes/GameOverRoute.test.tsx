import assert from "node:assert";
import { suite, test } from "mocha";
import * as React from "react";
import { createTRPCClient, TRPCClientError, type TRPCClient, type TRPCLink } from "@trpc/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { observable } from "@trpc/server/observable";
import type { inferRouterOutputs } from "@trpc/server";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";
import { ApplicationContextProvider } from "../context/app-context.js";
import { testApplicationContext } from "../test-support/app-context.js";
import { getReactTestingLibrary, installReactGlobal } from "../test-support/mocha-jsdom.js";
import { GameOverRoute } from "./GameOverRoute.js";

installReactGlobal(React);

type FakeGameOverTrpcClientOptions = {
	readonly currentGameRoundQuery?: () => Promise<GameOverCurrentGameRoundQueryResult>;
};

type GameOverCurrentGameRoundQueryResult = inferRouterOutputs<TRPCApplicationRouter>["session"]["currentGameRound"];

function createFakeTRPCClient(options: FakeGameOverTrpcClientOptions = {}): TRPCClient<TRPCApplicationRouter> {
	const { currentGameRoundQuery } = options;
	const fakeTrpcLink: TRPCLink<TRPCApplicationRouter> = () => {
		return ({ op }) => {
			return observable((observer) => {
				void (async () => {
					try {
						if (op.path !== "session.currentGameRound") {
							throw new Error(`Unexpected tRPC procedure: ${op.path}`);
						}

						const defaultCurrentGameRoundQuery = async (): Promise<GameOverCurrentGameRoundQueryResult> => {
							return {
								teams: [{ teamId: 1, name: "One", gamePoints: 15 }],
								gamePointsPerRound: [0, 2, 3, 4],
								hasPreviousGameRounds: true,
								isGameOver: true,
								winnerTeam: { teamId: 1, name: "One", gamePoints: 15 }
							};
						};
						const result = await (currentGameRoundQuery ?? defaultCurrentGameRoundQuery)();

						observer.next({ result: { type: "data", data: result } });
						observer.complete();
					} catch (error) {
						const errorCause = error instanceof Error ? error : new Error("Unknown tRPC test error");
						observer.error(TRPCClientError.from<TRPCApplicationRouter>(errorCause));
					}
				})();

				return () => {
					return undefined;
				};
			});
		};
	};

	return createTRPCClient<TRPCApplicationRouter>({ links: [fakeTrpcLink] });
}

async function renderGameOverRoute(
	trpcClient: TRPCClient<TRPCApplicationRouter>,
	queryClient: QueryClient
): Promise<void> {
	const trpc = createTRPCOptionsProxy<TRPCApplicationRouter>({ client: trpcClient, queryClient });
	const { render } = await getReactTestingLibrary();

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

suite("<GameOverRoute />", function () {
	test("navigates to teams selection when a new game is started", async function () {
		const trpcClient = createFakeTRPCClient();
		const userEventModule = await import("@testing-library/user-event");
		const userEvent = userEventModule.default;
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
					gcTime: 0
				}
			}
		});

		await renderGameOverRoute(trpcClient, queryClient);
		const { screen } = await getReactTestingLibrary();

		await userEvent.click(await screen.findByRole("button", { name: "Neues Spiel" }));

		assert.notStrictEqual(await screen.findByText("Teams selection"), undefined);
	});

	test("renders an explicit error state when loading the game over screen fails", async function () {
		const trpcClient = createFakeTRPCClient({
			currentGameRoundQuery: async () => {
				throw new Error("boom");
			}
		});
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
					gcTime: 0
				}
			}
		});

		await renderGameOverRoute(trpcClient, queryClient);
		const { screen } = await getReactTestingLibrary();

		assert.notStrictEqual(await screen.findByText("Spielende konnte nicht geladen werden"), undefined);
	});
});
