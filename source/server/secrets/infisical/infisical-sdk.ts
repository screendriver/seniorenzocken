import { InfisicalSDK } from "@infisical/sdk";

export type InitializedInfisicalSDK = InfisicalSDK;

export function createInfisicalSDK(accessToken: string): InitializedInfisicalSDK {
	return new InfisicalSDK({
		siteUrl: "https://infisical.82r.de"
	})
		.auth()
		.accessToken(accessToken);
}
