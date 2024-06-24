import { test, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import HelloWorld from "./HelloWorld.vue";

test("<HelloWorld />", async () => {
	const wrapper = await mountSuspended(HelloWorld);

	expect(wrapper.text()).toContain("Hello world");
});
