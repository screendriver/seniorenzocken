import type { HTMLAttributes, FunctionComponent } from "react";
import { match } from "ts-pattern";
import { mergeClassNames } from "./merge-class-names.js";

type BadgeVariant = "default" | "destructive" | "outline" | "score" | "secondary";

type BadgeProperties = HTMLAttributes<HTMLDivElement> & {
	readonly variant?: BadgeVariant;
};

function getBadgeVariantClassName(variant: BadgeVariant): string {
	return match(variant)
		.with("default", () => {
			return "border-transparent bg-slate-200 text-slate-900";
		})
		.with("destructive", () => {
			return "border-transparent bg-red-700 text-red-100";
		})
		.with("outline", () => {
			return "text-foreground";
		})
		.with("score", () => {
			return "border-transparent bg-orange-500 text-orange-950";
		})
		.with("secondary", () => {
			return "border-transparent bg-slate-700 text-slate-100";
		})
		.exhaustive();
}

export const Badge: FunctionComponent<BadgeProperties> = (properties) => {
	const { className, variant = "default", ...badgeProperties } = properties;
	return (
		<div
			className={mergeClassNames(
				"inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors",
				getBadgeVariantClassName(variant),
				className
			)}
			{...badgeProperties}
		/>
	);
};
