import "./assets/css/tailwind.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { createHead } from "@unhead/vue/client";

import App from "./App.vue";
import { router } from "./router.js";

const app = createApp(App);
const pinia = createPinia();
const head = createHead();

app.use(pinia);
app.use(router);
app.use(head);

app.mount("#application");
