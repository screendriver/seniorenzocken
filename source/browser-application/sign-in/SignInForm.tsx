import { useState, type FunctionComponent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertErrorMessage } from "../alert/AlertErrorMessage.js";
import { useApplicationContext } from "../context/app-context.js";
import { Button } from "../ui/button.js";
import { UsernameInput } from "./UsernameInput.js";
import { PasswordInput } from "./PasswordInput.js";

export const SignInForm: FunctionComponent = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [signInFailed, setSignInFailed] = useState(false);
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const applicationContext = useApplicationContext();
	const { trpc } = applicationContext;
	const sessionTokenQueryKey = trpc.session.token.queryKey();

	const authenticateMutation = useMutation({
		mutationKey: ["authenticate"],
		async mutationFn() {
			return applicationContext.authenticationApi.authenticate({ username, password });
		},
		onError() {
			setSignInFailed(true);
		},
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: sessionTokenQueryKey });
			await navigate("/teams-selection");
		}
	});

	return (
		<section className="col-start-1 col-end-5 grid grid-cols-subgrid rounded-xl bg-slate-800 text-slate-100 sm:col-start-2 sm:col-end-4 md:col-start-3 md:col-end-7 lg:col-start-4 lg:col-end-10">
			<form
				onSubmit={(formSubmissionEvent) => {
					formSubmissionEvent.preventDefault();
					setSignInFailed(false);
					authenticateMutation.mutate();
				}}
				className="col-span-full mx-6 my-8 grid grid-flow-col grid-cols-subgrid grid-rows-3 items-center gap-2 lg:col-start-2 lg:col-end-6"
			>
				{signInFailed ? (
					<div className="col-span-full mb-2">
						<AlertErrorMessage errorMessage="Login fehlgeschlagen" />
					</div>
				) : null}
				<UsernameInput username={username} onChange={setUsername} />
				<PasswordInput password={password} onChange={setPassword} />
				<div className="col-span-full justify-self-center">
					<Button type="submit" disabled={authenticateMutation.isPending}>
						Anmelden
					</Button>
				</div>
			</form>
		</section>
	);
};
