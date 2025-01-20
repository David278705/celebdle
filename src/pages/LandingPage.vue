<!-- src/pages/LandingPage.vue -->
<template>
  <!-- Usamos la clase 'dark' en el contenedor raíz para modo oscuro -->

  <div
    class="dark text-white flex flex-col items-center justify-center cursor-default"
  >
    <!-- Logo -->
    <img
      src="/img/celeb-dle-logo.png"
      :alt="t('gameTitle')"
      class="animate-float w-80 h-auto"
    />

    <h1
      class="font-montserrat transition text-3xl font-bold mb-4 hover:scale-110"
    >
      {{ t("landingTitleWelcome") }}
      <span class="text-amber-300">Celebdle</span>!
    </h1>

    <p class="font-montserrat text-lg text-center max-w-prose mb-8">
      {{ t("landingDescription") }}
    </p>

    <div>
      <button
        @click="goToGame"
        class="font-montserrat transition bg-amber-300 px-6 py-3 text-black rounded-lg hover:bg-amber-300 hover:scale-110"
      >
        {{ t("landingPlayButton") }}
      </button>
    </div>

    <p class="flex items-center font-montserrat text-neutral-400 mt-20">
      {{ t("poweredBy") }}
      <a target="_blank" href="https://openai.com">
        <img
          class="w-16 ms-2 transition hover:scale-110"
          src="/img/openai.png"
          alt="OpenAI Logo"
        />
      </a>
    </p>
  </div>
  <GoogleAd class="mt-4" />
  <GoogleAd class="mt-4" />
</template>

<script>
import { useRouter } from "vue-router";
import { ref } from "vue";
import i18n from "@/lang.js"; // Importamos tu archivo de traducciones
import GoogleAd from "../components/GoogleAd.vue";

export default {
  name: "LandingPage",
  // Recibimos el idioma como prop, por defecto "es"
  props: {
    lang: {
      type: String,
      default: "es",
    },
  },
  components: {
    GoogleAd,
  },

  setup(props) {
    const router = useRouter();

    // Función traductora
    const t = (key) => {
      const translations = i18n[props.lang] || i18n.es; // fallback a es
      return translations[key] || key;
    };

    const goToGame = () => {
      // Navegamos a /play (podrías añadir ?lang=... si gustas)
      router.push("/play");
    };

    return {
      t,
      goToGame,
    };
  },
};
</script>

<style scoped>
/* Estilos específicos para tu landing (si necesitas) */
</style>
