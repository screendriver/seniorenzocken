import type { FunctionComponent, SelectHTMLAttributes } from "react";
import { mergeClassNames } from "./merge-class-names.js";

type SelectProperties = SelectHTMLAttributes<HTMLSelectElement>;

export const Select: FunctionComponent<SelectProperties> = (properties) => {
	const { className, children, ...selectProperties } = properties;

	return (
		<select
			className={mergeClassNames(
				"flex h-10 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			{...selectProperties}
		>
			{children}
		</select>
	);
};
