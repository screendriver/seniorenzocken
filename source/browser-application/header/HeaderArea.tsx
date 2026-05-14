import type { FunctionComponent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isNonEmptyString } from "@sindresorhus/is";
import { useNavigate } from "react-router-dom";
import { useApplicationContext } from "../context/app-context.js";
import wattenCardsImage from "../assets/images/watten-karten.jpg";
import { Button } from "../ui/button.js";

export const HeaderArea: FunctionComponent = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const applicationContext = useApplicationContext();
	const { trpc } = applicationContext;
	const sessionTokenQueryKey = trpc.session.token.queryKey();

	const sessionTokenQuery = useQuery(trpc.session.token.queryOptions());

	const logoutMutation = useMutation({
		async mutationFn() {
			return applicationContext.authenticationApi.logout();
		},
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: sessionTokenQueryKey });
			await navigate("/sign-in", { replace: true });
		}
	});

	if (isNonEmptyString(sessionTokenQuery.data)) {
		return (
			<header className="flex justify-end border-b border-slate-700/80 bg-slate-800/95 p-3">
				<Button
					onClick={() => {
						logoutMutation.mutate();
					}}
					variant="outline"
					size="sm"
				>
					Abmelden
				</Button>
			</header>
		);
	}

	return (
		<header className="pointer-events-none absolute top-0 left-0 z-0 h-[22rem] w-full overflow-hidden md:h-[24rem]">
			<img src={wattenCardsImage} alt="Karten" className="h-full w-full scale-105 object-cover blur-md" />
			<div className="absolute inset-0 bg-slate-950/20" />
			<div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-slate-950/70 to-slate-950" />
		</header>
	);
};
