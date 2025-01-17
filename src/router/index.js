import { createRouter, createWebHashHistory } from "vue-router";
import LandingPage from "@/pages/LandingPage.vue";
import GameView from "@/pages/GameView.vue";
import TermsView from "@/pages/footer/TermsView.vue";
import PrivacyView from "@/pages/footer/PrivacyView.vue";
import CookiesView from "@/pages/footer/CookiesView.vue";
import DmcaView from "@/pages/footer/DmcaView.vue";
import AdminCelebrities from "@/pages/admin/AdminCelebrities.vue";

const routes = [
  {
    path: "/:lang(es|en)?", // Idioma opcional en la raíz
    component: LandingPage,
    props: (route) => ({ lang: route.params.lang }),
  },
  {
    path: "/play/:lang(es|en)?", // Idioma opcional en /play
    component: GameView,
    props: (route) => ({ lang: route.params.lang }),
  },
  {
    path: "/terms/:lang(es|en)?",
    name: "Terms",
    component: TermsView,
  },
  {
    path: "/privacy/:lang(es|en)?",
    name: "Privacy",
    component: PrivacyView,
  },
  {
    path: "/cookies/:lang(es|en)?",
    name: "Cookies",
    component: CookiesView,
  },
  {
    path: "/dmca/:lang(es|en)?",
    name: "DMCA",
    component: DmcaView,
  },
  {
    path: "/admin/3184239974/:lang(es|en)?",
    name: "AdminCelebrities",
    component: AdminCelebrities,
    props: (route) => ({
      lang: route.query.lang,
    }),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
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

// Guardia global para asegurarnos de que siempre haya un idioma en el path
router.beforeEach((to, from, next) => {
  const supportedLangs = ["es", "en"];
  const defaultLang =
    localStorage.getItem("lang") ||
    (navigator.language.includes("es") ? "es" : "en");

  const lang = to.params.lang;

  // Si el idioma ya es válido y está en el lugar correcto, continuamos
  if (lang && supportedLangs.includes(lang)) {
    next();
  } else {
    // Determinamos la nueva ruta sin el idioma actual
    const pathWithoutLang = to.path.replace(/\/(es|en)$/, ""); // Elimina el idioma al final si ya existe
    const newPath = `${pathWithoutLang}/${defaultLang}`.replace(/\/\//g, "/");

    // Redirigimos solo si la nueva ruta es diferente a la actual
    if (to.fullPath === newPath) {
      next();
    } else {
      next({
        path: newPath,
        query: to.query,
        replace: true,
      });
    }
  }
});

export default router;
