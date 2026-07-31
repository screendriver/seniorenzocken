import assert from "node:assert";
import { suite, test } from "mocha";
import * as React from "react";
import { createTRPCClient, TRPCClientError, type TRPCClient, type TRPCLink } from "@trpc/client";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { observable } from "@trpc/server/observable";
import type { inferRouterOutputs } from "@trpc/server";
import type { Except } from "type-fest";
import type { TRPCApplicationRouter } from "../../server-shared/trpc-application-router.js";
import { ApplicationContextProvider } from "../context/app-context.js";
import { testApplicationContext } from "../test-support/app-context.js";
import { getReactTestingLibrary, installReactGlobal } from "../test-support/mocha-jsdom.js";
import { SessionGameRoute } from "./SessionGameRoute.js";

installReactGlobal(React);

type FakeSessionGameRouteTrpcClientOptions = {
	readonly currentGameRoundQuery?: () => Promise<SessionCurrentGameRoundQueryResult>;
};

type SessionCurrentGameRoundQueryResult = Except<
	inferRouterOutputs<TRPCApplicationRouter>["session"]["currentGameRound"],
	"gamePointsPerRound"
> & {
	readonly gamePointsPerRound: readonly number[];
};

function createFakeTRPCClient(options: FakeSessionGameRouteTrpcClientOptions = {}): TRPCClient<TRPCApplicationRouter> {
	const { currentGameRoundQuery } = options;
	const defaultCurrentGameRoundQuery = async (): Promise<SessionCurrentGameRoundQueryResult> => {
		return {
			teams: [{ teamId: 1, name: "One", gamePoints: 0 }],
			gamePointsPerRound: [0, 2],
			hasPreviousGameRounds: false,
			isGameOver: false
		};
	};
	const fakeProcedureResults: Readonly<
		Record<string, () => Promise<SessionCurrentGameRoundQueryResult | undefined>>
	> = {
		"session.currentGameRound": currentGameRoundQuery ?? defaultCurrentGameRoundQuery,
		"session.nextGameRound": async () => {
			return undefined;
		},
		"session.previousGameRound": async () => {
			return undefined;
		}
	};
	const fakeTrpcLink: TRPCLink<TRPCApplicationRouter> = () => {
		return ({ op }) => {
			return observable((observer) => {
				void (async () => {
					try {
						const procedureResult = fakeProcedureResults[op.path];
						if (procedureResult === undefined) {
							throw new Error(`Unexpected tRPC procedure: ${op.path}`);
						}
						const result = await procedureResult();

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

suite("<SessionGameRoute />", function () {
	test("renders headings for teams", async function () {
		const trpcClient = createFakeTRPCClient();
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					gcTime: 0
				}
			}
		});
		const trpc = createTRPCOptionsProxy<TRPCApplicationRouter>({ client: trpcClient, queryClient });
		const { render, screen } = await getReactTestingLibrary();
		render(
			<QueryClientProvider client={queryClient}>
				<ApplicationContextProvider applicationContext={{ ...testApplicationContext, trpc }}>
					<MemoryRouter>
						<SessionGameRoute />
					</MemoryRouter>
				</ApplicationContextProvider>
			</QueryClientProvider>
		);

		assert.notStrictEqual(await screen.findByText("One"), undefined);
	});

	test("renders an explicit error state when loading the game round fails", async function () {
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
		const trpc = createTRPCOptionsProxy<TRPCApplicationRouter>({ client: trpcClient, queryClient });
		const { render, screen } = await getReactTestingLibrary();

		render(
			<QueryClientProvider client={queryClient}>
				<ApplicationContextProvider applicationContext={{ ...testApplicationContext, trpc }}>
					<MemoryRouter>
						<SessionGameRoute />
					</MemoryRouter>
				</ApplicationContextProvider>
			</QueryClientProvider>
		);

		assert.notStrictEqual(await screen.findByText("Spielstand konnte nicht geladen werden"), undefined);
	});
});
