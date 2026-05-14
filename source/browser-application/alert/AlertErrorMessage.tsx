import type { FunctionComponent } from "react";
import { Alert } from "../ui/alert.js";

type AlertErrorMessageProperties = {
	readonly errorMessage: string;
};

export const AlertErrorMessage: FunctionComponent<AlertErrorMessageProperties> = (properties) => {
	const { errorMessage } = properties;

	return (
		<Alert variant="destructive" className="w-full border-red-600 bg-red-950/80 text-red-100">
			<span>{errorMessage}</span>
		</Alert>
	);
};
