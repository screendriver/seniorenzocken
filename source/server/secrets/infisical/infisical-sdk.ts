import { InfisicalSDK } from "@infisical/sdk";

export type InitializedInfisicalSDK = InfisicalSDK;

export function createInfisicalSDK(accessToken: string): InitializedInfisicalSDK {
	const infisicalSDK = new InfisicalSDK({
		siteUrl: "https://infisical.ts.82r.de"
	});

	return infisicalSDK.auth().accessToken(accessToken);
}
