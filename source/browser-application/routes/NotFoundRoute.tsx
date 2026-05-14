import { useEffect, type FunctionComponent } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationContext } from "../context/app-context.js";

export const NotFoundRoute: FunctionComponent = () => {
	const navigate = useNavigate();
	const applicationContext = useApplicationContext();
	const { browserRuntime } = applicationContext;

	useEffect(() => {
		const listener = (): void => {
			void navigate("/teams", { replace: true });
		};
		browserRuntime.addWindowEventListener("keydown", listener);
		return () => {
			browserRuntime.removeWindowEventListener("keydown", listener);
		};
	}, [browserRuntime, navigate]);

	return (
		<main className="box-border flex h-screen items-center justify-center bg-[#000084] p-2.5 text-[10px] !leading-none font-normal text-[#bbb] sm:text-base lg:text-[24px] lg:font-normal">
			<div className="text-center">Press any key to continue...</div>
		</main>
	);
};
