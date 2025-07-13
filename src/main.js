// src/main.js
import { createApp } from "vue";
import { createHead } from "@vueuse/head";
import App from "./App.vue";
import router from "./router"; // Importamos el router
import "./style.css"; // Tailwind

const app = createApp(App);
const head = createHead();

app.use(router);
app.use(head);
app.mount("#app");
