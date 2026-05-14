import type { HTMLAttributes, FunctionComponent } from "react";
import { match } from "ts-pattern";
import { mergeClassNames } from "./merge-class-names.js";

type AlertVariant = "default" | "destructive";

type AlertProperties = HTMLAttributes<HTMLDivElement> & {
	readonly variant?: AlertVariant;
};

function getAlertVariantClassName(variant: AlertVariant): string {
	return match(variant)
		.with("default", () => {
			return "bg-background text-foreground";
		})
		.with("destructive", () => {
			return "border-red-500/50 bg-red-950/50 text-red-200";
		})
		.exhaustive();
}

export const Alert: FunctionComponent<AlertProperties> = (properties) => {
	const { className, variant = "default", ...alertProperties } = properties;

	return (
		<div
			role="alert"
			className={mergeClassNames(
				"relative w-full rounded-lg border px-4 py-3 text-sm",
				getAlertVariantClassName(variant),
				className
			)}
			{...alertProperties}
		/>
	);
};
