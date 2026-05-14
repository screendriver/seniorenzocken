import type { FunctionComponent, HTMLAttributes } from "react";
import { mergeClassNames } from "./merge-class-names.js";

type CardProperties = HTMLAttributes<HTMLElement>;

export const Card: FunctionComponent<CardProperties> = (properties) => {
	const { className, children, ...cardProperties } = properties;

	return (
		<section
			className={mergeClassNames(
				"rounded-lg border border-slate-500/40 bg-slate-700/90 p-2.5 shadow-sm",
				className
			)}
			{...cardProperties}
		>
			{children}
		</section>
	);
};
