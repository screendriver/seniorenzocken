import type Maybe from "true-myth/maybe";
import type { Session } from "./session/session-schema.js";

export type HonoEnvironment = {
	Variables: {
		session: Maybe<Session>;
	};
};
