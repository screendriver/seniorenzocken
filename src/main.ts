import App from "./App.svelte";

const htmlBodyElement = document.querySelector("body");

if (htmlBodyElement === null) {
	throw new Error('Element with id "app" could not be found');
}

});

new App({
	target: htmlBodyElement,
});
