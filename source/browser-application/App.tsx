import type { FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import { HeaderArea } from "./header/HeaderArea.js";
import { useApplicationContext } from "./context/app-context.js";

type ApplicationLayoutProperties = {
	readonly activateWakeLock: () => void;
};

const ApplicationLayout: FunctionComponent<ApplicationLayoutProperties> = (properties) => {
	const { activateWakeLock } = properties;

	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-50">
			<HeaderArea />
			<main
				onClick={activateWakeLock}
				className="relative z-10 mx-6 grid flex-1 grid-cols-4 items-center gap-4 py-6 md:mx-auto md:w-full md:grid-cols-8 lg:max-w-7xl lg:grid-cols-12"
			>
				<Outlet />
			</main>
		</div>
	);
};

export const App: FunctionComponent = () => {
	const applicationContext = useApplicationContext();
	function activateWakeLock(): void {
		applicationContext.fireAndForgetExecutor.execute(async function requestWakeLockScreen(): Promise<void> {
			await applicationContext.browserRuntime.requestWakeLockScreen();
		});
	}

	return <ApplicationLayout activateWakeLock={activateWakeLock} />;
};
