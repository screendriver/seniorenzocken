import ImageKit from "imagekit-javascript";
import App from "./App.svelte";

const htmlBodyElement = document.querySelector("body");

if (htmlBodyElement === null) {
	throw new Error('Element with id "app" could not be found');
}

const imageKit = new ImageKit({
	urlEndpoint: "https://ik.imagekit.io/qi52orkcz"
});

new App({
	target: htmlBodyElement,
	props: {
		imageKit
	}
});
