// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "../pages/LandingPage.vue";

const routes = [
  {
    path: "/",
    name: "LandingPage",
    component: LandingPage,
  },
  // Otras rutas (por ejemplo /game, /results, etc.)
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
