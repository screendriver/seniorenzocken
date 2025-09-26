import type { Maybe } from "true-myth/maybe";
import type { SessionDatabaseSelect } from "./session/session-database-schema.js";

export type HonoEnvironment = {
	Variables: {
		session: Maybe<SessionDatabaseSelect>;
	};
};
