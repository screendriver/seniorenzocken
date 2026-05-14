type ClassNameValue = string | false | null | undefined;

export function mergeClassNames(...classNameValues: ClassNameValue[]): string {
	return classNameValues
		.filter((classNameValue): classNameValue is string => {
			return typeof classNameValue === "string" && classNameValue.length > 0;
		})
		.join(" ");
}
