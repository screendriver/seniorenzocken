import type { ButtonHTMLAttributes, FunctionComponent, ReactNode } from "react";
import { match } from "ts-pattern";
import { mergeClassNames } from "./merge-class-names.js";

type ButtonVariant = "default" | "outline" | "secondary";
type ButtonSize = "default" | "sm";

type ButtonProperties = ButtonHTMLAttributes<HTMLButtonElement> & {
	readonly children: ReactNode;
	readonly variant?: ButtonVariant;
	readonly size?: ButtonSize;
};

function getButtonVariantClassName(variant: ButtonVariant): string {
	return match(variant)
		.with("default", () => {
			return "bg-sky-600 text-white hover:bg-sky-500";
		})
		.with("outline", () => {
			return "border border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800/60";
		})
		.with("secondary", () => {
			return "bg-slate-700 text-slate-100 hover:bg-slate-600";
		})
		.exhaustive();
}

function getButtonSizeClassName(size: ButtonSize): string {
	return match(size)
		.with("default", () => {
			return "h-10 px-4 py-2";
		})
		.with("sm", () => {
			return "h-8 rounded-md px-3 text-xs";
		})
		.exhaustive();
}

export const Button: FunctionComponent<ButtonProperties> = (properties) => {
	const {
		className,
		variant = "default",
		size = "default",
		type: buttonType = "button",
		children,
		...buttonProperties
	} = properties;

	return (
		<button
			type={buttonType}
			className={mergeClassNames(
				"inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
				getButtonVariantClassName(variant),
				getButtonSizeClassName(size),
				className
			)}
			{...buttonProperties}
		>
			{children}
		</button>
	);
};
