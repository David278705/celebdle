import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "@/pages/LandingPage.vue";
import GameView from "@/pages/GameView.vue";
import TermsView from "@/pages/footer/TermsView.vue";
import PrivacyView from "@/pages/footer/PrivacyView.vue";
import CookiesView from "@/pages/footer/CookiesView.vue";
import DmcaView from "@/pages/footer/DmcaView.vue";

const routes = [
  {
    path: "/",
    component: LandingPage,
    props: (route) => ({
      lang: route.query.lang,
    }),
  },
  {
    path: "/play",
    component: GameView,
    props: (route) => ({
      lang: route.query.lang,
    }),
  },
  {
    path: "/terms",
    name: "Terms",
    component: TermsView,
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: PrivacyView,
  },
  {
    path: "/cookies",
    name: "Cookies",
    component: CookiesView,
  },
  {
    path: "/dmca",
    name: "DMCA",
    component: DmcaView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // <--- Aquí añadimos scrollBehavior:
  scrollBehavior(to, from, savedPosition) {
    // Simplemente retornamos un objeto que indica que queremos
    // posicionar el scroll en la parte superior (top = 0).
    // Si quieres un scroll suave, lo puedes manejar con `behavior: 'smooth'`
    // (aunque no todos los navegadores lo soportan igual).
    return { top: 0, behavior: "smooth" };
  },
});

// Guardia global para agregar `lang` como query param
router.beforeEach((to, from, next) => {
  const selectedLang =
    localStorage.getItem("lang") ||
    (navigator.language.includes("es") ? "es" : "en");

  if (!to.query.lang) {
    next({
      ...to,
      query: { ...to.query, lang: selectedLang },
    });
  } else {
    next();
  }
});

export default router;
