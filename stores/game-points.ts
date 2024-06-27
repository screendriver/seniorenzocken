export const availableGamePoints = [0, 2, 3, 4] as const;

export type GamePoint = (typeof availableGamePoints)[number];
