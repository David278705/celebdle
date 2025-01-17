<template>
  <footer class="bg-neutral-800 text-white py-3 px-4 rounded-lg mt-10">
    <div
      class="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2"
    >
      <!-- Texto copyright -->
      <div class="text-sm">
        {{ t("footerCopyright", currentYear) }}
      </div>

      <!-- Secciones legales -->
      <nav class="lg:flex gap-4 text-sm text-amber-300">
        <router-link
          to="/terms"
          class="text-amber-300 hover:text-amber-400 transition text-sm"
        >
          {{ t("footerTerms") }}
        </router-link>
        -
        <router-link
          to="/privacy"
          class="text-amber-300 hover:text-amber-400 transition text-sm"
        >
          {{ t("footerPrivacy") }}
        </router-link>
        -
        <router-link
          to="/cookies"
          class="text-amber-300 hover:text-amber-400 transition text-sm"
        >
          {{ t("footerCookies") }}
        </router-link>
        -
        <!-- <router-link
          to="/dmca"
          class="text-amber-300 hover:text-amber-400 transition text-sm"
        >
          {{ t("footerDmca") }}
        </router-link> -->

        <select
          class="text-amber-300 hover:text-amber-400 transition text-sm bg-neutral-800"
          @change="changeLanguage($event.target.value)"
          :value="currentLang"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </nav>
    </div>
  </footer>
</template>

<script>
import { inject, ref } from "vue";
import i18n from "@/lang.js";

export default {
  name: "Footer",
  setup() {
    const lang = inject("lang", "es");
    const currentYear = new Date().getFullYear();
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    const currentLang = ref(
      urlLang ||
        localStorage.getItem("lang") ||
        (navigator.language.includes("es") ? "es" : "en")
    );

    const t = (key, param = null) => {
      const translations = i18n[currentLang.value] || i18n.es;
      if (typeof translations[key] === "function") {
        return translations[key](param);
      }
      return translations[key] || key;
    };

    const changeLanguage = (newLang) => {
      localStorage.setItem("lang", newLang);
      window.location.search = `?lang=${newLang}`;
    };

    return {
      currentYear,
      t,
      currentLang,
      changeLanguage,
    };
  },
};
</script>
