import { JSDOM } from "jsdom";
import type * as ReactModule from "react";
import type * as ReactTestingLibraryModule from "@testing-library/react";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
	url: "http://localhost/",
	pretendToBeVisual: true
});

const previousGlobalPropertyDescriptors = new Map<string, PropertyDescriptor | undefined>();

function rememberGlobalPropertyDescriptor(propertyName: string): void {
	if (!previousGlobalPropertyDescriptors.has(propertyName)) {
		previousGlobalPropertyDescriptors.set(propertyName, Object.getOwnPropertyDescriptor(globalThis, propertyName));
	}
}

function defineGlobalProperty(propertyName: string, propertyDescriptor: PropertyDescriptor): void {
	const previousGlobalPropertyDescriptor = Object.getOwnPropertyDescriptor(globalThis, propertyName);

	if (previousGlobalPropertyDescriptor?.configurable === false) {
		return;
	}

	rememberGlobalPropertyDescriptor(propertyName);
	Object.defineProperty(globalThis, propertyName, {
		configurable: true,
		enumerable: propertyDescriptor.enumerable ?? false,
		value: propertyDescriptor.value,
		writable: true
	});
}

const requiredBrowserGlobalValues: Readonly<Record<string, unknown>> = {
	window: dom.window,
	document: dom.window.document,
	navigator: dom.window.navigator,
	location: dom.window.location,
	HTMLElement: dom.window.HTMLElement,
	Element: dom.window.Element,
	Node: dom.window.Node,
	MutationObserver: dom.window.MutationObserver,
	getComputedStyle: dom.window.getComputedStyle,
	requestAnimationFrame: dom.window.requestAnimationFrame,
	cancelAnimationFrame: dom.window.cancelAnimationFrame
};

for (const [propertyName, propertyValue] of Object.entries(requiredBrowserGlobalValues)) {
	defineGlobalProperty(propertyName, {
		configurable: true,
		enumerable: true,
		value: propertyValue,
		writable: true
	});
}

for (const propertyName of Object.getOwnPropertyNames(dom.window)) {
	const propertyDescriptor = Object.getOwnPropertyDescriptor(dom.window, propertyName);
	const isMissingGlobalDataProperty =
		!Object.hasOwn(globalThis, propertyName) &&
		propertyDescriptor !== undefined &&
		Object.hasOwn(propertyDescriptor, "value");

	if (isMissingGlobalDataProperty) {
		defineGlobalProperty(propertyName, propertyDescriptor);
	}
}

type ReactTestingLibrary = typeof ReactTestingLibraryModule;
type ReactNamespace = typeof ReactModule;
type MochaHooks = {
	beforeAll: () => Promise<void>;
	afterEach: () => void;
	afterAll: () => void;
};

const reactTestingLibraryPromise = import("@testing-library/react");

export async function getReactTestingLibrary(): Promise<ReactTestingLibrary> {
	return reactTestingLibraryPromise;
}

function createMochaHooks(): MochaHooks {
	let cleanupBrowserTest = (): void => {
		return undefined;
	};

	return {
		async beforeAll(): Promise<void> {
			const testingLibrary = await getReactTestingLibrary();
			cleanupBrowserTest = testingLibrary.cleanup;
		},
		afterEach(): void {
			cleanupBrowserTest();

			if (dom.window.document.body.childNodes.length > 0) {
				dom.window.document.body.replaceChildren();
			}
		},
		afterAll(): void {
			dom.window.close();

			for (const [propertyName, previousGlobalPropertyDescriptor] of previousGlobalPropertyDescriptors) {
				if (previousGlobalPropertyDescriptor === undefined) {
					Reflect.deleteProperty(globalThis, propertyName);
				} else {
					Object.defineProperty(globalThis, propertyName, previousGlobalPropertyDescriptor);
				}
			}
		}
	};
}

export const mochaHooks = createMochaHooks();

export function installReactGlobal(reactModule: ReactNamespace): void {
	defineGlobalProperty("React", {
		configurable: true,
		enumerable: true,
		value: reactModule,
		writable: true
	});
}
