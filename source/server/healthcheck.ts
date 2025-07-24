import { object, string, literal, pipe, nonEmpty, parse } from "valibot";
import ky from "ky";

const healthResponseSchema = object({
	status: literal("OK"),
	timestamp: pipe(string(), nonEmpty()),
});

try {
	const response = await ky("http://localhost:4000/health", { timeout: 2000 }).json();
	parse(healthResponseSchema, response);
} catch (error: unknown) {
	console.error(error);

	process.exitCode = 1;
}
