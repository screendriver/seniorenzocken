import App from "./App.svelte";

const appHtmlElement = document.getElementById("app");

if (appHtmlElement === null) {
	throw new Error('Element with id "app" could not be found');
}

const app = new App({
	target: appHtmlElement
});

export default app;
