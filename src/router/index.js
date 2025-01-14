import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "@/pages/LandingPage.vue";
import GameView from "@/pages/GameView.vue";

const routes = [
  {
    path: "/",
    component: LandingPage,
  },
  {
    path: "/play",
    component: GameView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
