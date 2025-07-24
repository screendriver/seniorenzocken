import type { Clock } from "./clock.ts";

export function createFakeClock(): Clock {
	return {
		get now() {
			return new Date("2025-07-24T09:10:20.153Z");
		},
	};
}
