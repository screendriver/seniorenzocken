import { createBrowserRouter, redirect } from "react-router-dom";
import { isNull } from "@sindresorhus/is";
import type { QueryClient } from "@tanstack/react-query";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { TRPCApplicationRouter } from "../server-shared/trpc-application-router.js";
import { App } from "./App.js";
import { TeamsRoute } from "./routes/TeamsRoute.js";

type CreateRouterOptions = {
	readonly queryClient: QueryClient;
	readonly trpc: TRPCOptionsProxy<TRPCApplicationRouter>;
};

export function redirectUnauthenticatedSession(sessionToken: string | null): Response | null {
	if (isNull(sessionToken)) {
		return redirect("/teams");
	}

	return null;
}

export function redirectAuthenticatedSessionFromSignIn(sessionToken: string | null): Response | null {
	if (!isNull(sessionToken)) {
		return redirect("/teams-selection");
	}

	return null;
}

export function createRouter(options: CreateRouterOptions): ReturnType<typeof createBrowserRouter> {
	const { queryClient, trpc } = options;

	async function requireAuthentication(): Promise<Response | null> {
		const sessionToken = await queryClient.fetchQuery(trpc.session.token.queryOptions());

		return redirectUnauthenticatedSession(sessionToken);
	}

	async function redirectSignedInUserAwayFromSignIn(): Promise<Response | null> {
		const sessionToken = await queryClient.fetchQuery(trpc.session.token.queryOptions());

		return redirectAuthenticatedSessionFromSignIn(sessionToken);
	}

	return createBrowserRouter([
		{
			path: "/",
			element: <App />,
			children: [
				{
					index: true,
					loader() {
						return redirect("/teams");
					}
				},
				{ path: "teams", element: <TeamsRoute /> },
				{
					path: "game",
					async lazy() {
						const gameRouteModule = await import("./routes/GameRoute.js");
						return { Component: gameRouteModule.GameRoute };
					}
				},
				{
					path: "sign-in",
					loader: redirectSignedInUserAwayFromSignIn,
					async lazy() {
						const signInRouteModule = await import("./routes/SignInRoute.js");
						return { Component: signInRouteModule.SignInRoute };
					}
				},
				{
					path: "teams-selection",
					loader: requireAuthentication,
					async lazy() {
						const teamsSelectionRouteModule = await import("./routes/TeamsSelectionRoute.js");
						return {
							Component: teamsSelectionRouteModule.TeamsSelectionRoute
						};
					}
				},
				{
					path: "session-game",
					loader: requireAuthentication,
					async lazy() {
						const sessionGameRouteModule = await import("./routes/SessionGameRoute.js");
						return { Component: sessionGameRouteModule.SessionGameRoute };
					}
				},
				{
					path: "game-over",
					loader: requireAuthentication,
					async lazy() {
						const gameOverRouteModule = await import("./routes/GameOverRoute.js");
						return { Component: gameOverRouteModule.GameOverRoute };
					}
				},
				{
					path: "*",
					async lazy() {
						const notFoundRouteModule = await import("./routes/NotFoundRoute.js");
						return { Component: notFoundRouteModule.NotFoundRoute };
					}
				}
			]
		}
	]);
}
