export type Clock = {
	get now(): Date;
};

export function createClock(): Clock {
	return {
		get now() {
			return new Date();
		}
	};
}
