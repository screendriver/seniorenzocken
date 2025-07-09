import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { cors as honoCors } from "hono/cors";

type Options = {
	readonly enableCors: boolean;
};

export function corsMiddleware(options: Options): MiddlewareHandler {
	return createMiddleware(async (context, next) => {
		if (options.enableCors) {
			const honoCorsMiddleware = honoCors();

			return honoCorsMiddleware(context, next);
		}

		await next();
	});
}
