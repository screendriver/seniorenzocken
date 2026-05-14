import {
	createContext,
	useContext,
	useMemo,
	type ButtonHTMLAttributes,
	type FunctionComponent,
	type HTMLAttributes,
	type ReactNode
} from "react";
import { mergeClassNames } from "./merge-class-names.js";

type ToggleGroupContextValue = {
	readonly selectedValue: string;
	readonly onValueChange: (value: string) => void;
};

type ToggleGroupProperties = HTMLAttributes<HTMLDivElement> & {
	readonly selectedValue: string;
	readonly onValueChange: (value: string) => void;
	readonly children: ReactNode;
};

type ToggleGroupItemProperties = ButtonHTMLAttributes<HTMLButtonElement> & {
	readonly value: string;
	readonly children: ReactNode;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export const ToggleGroup: FunctionComponent<ToggleGroupProperties> = (properties) => {
	const { className, selectedValue, onValueChange, children, ...toggleGroupProperties } = properties;
	const toggleGroupContextValue = useMemo<ToggleGroupContextValue>(() => {
		return { selectedValue, onValueChange };
	}, [selectedValue, onValueChange]);

	return (
		<ToggleGroupContext.Provider value={toggleGroupContextValue}>
			<div
				role="radiogroup"
				className={mergeClassNames("grid overflow-hidden rounded-md border border-slate-950/70", className)}
				{...toggleGroupProperties}
			>
				{children}
			</div>
		</ToggleGroupContext.Provider>
	);
};

export const ToggleGroupItem: FunctionComponent<ToggleGroupItemProperties> = (properties) => {
	const { className, value, children, disabled, ...toggleGroupItemProperties } = properties;
	const toggleGroupContext = useContext(ToggleGroupContext);

	if (toggleGroupContext === null) {
		throw new Error("Could not use toggle group item because no toggle group provider value was provided");
	}

	const isSelected = toggleGroupContext.selectedValue === value;

	return (
		<button
			type="button"
			role="radio"
			aria-checked={isSelected}
			disabled={disabled}
			className={mergeClassNames(
				"h-12 text-xl font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
				isSelected ? "bg-sky-700 text-slate-50" : "bg-slate-950 text-slate-300 hover:bg-slate-900",
				className
			)}
			onClick={() => {
				toggleGroupContext.onValueChange(value);
			}}
			{...toggleGroupItemProperties}
		>
			{children}
		</button>
	);
};
