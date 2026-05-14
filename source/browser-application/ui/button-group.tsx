import type { FunctionComponent, HTMLAttributes } from "react";
import { mergeClassNames } from "./merge-class-names.js";

type ButtonGroupProperties = HTMLAttributes<HTMLDivElement>;

export const ButtonGroup: FunctionComponent<ButtonGroupProperties> = (properties) => {
	const { className, children, ...buttonGroupProperties } = properties;

	return (
		<div
			role="group"
			className={mergeClassNames("inline-flex items-center gap-3", className)}
			{...buttonGroupProperties}
		>
			{children}
		</div>
	);
};
