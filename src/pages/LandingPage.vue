<!-- src/pages/LandingPage.vue -->
<template>
  <!-- Usamos la clase 'dark' en el contenedor raíz para forzar el modo oscuro -->
  <div
    class="dark text-white flex flex-col items-center justify-center cursor-default"
  >
    <!-- Logo ubicado en 'public/img/celeb-dle-logo.png' -->

    <img
      src="/img/celeb-dle-logo.png"
      alt="Celebdle Logo"
      class="animate-float w-80 h-auto"
    />

    <h1
      class="font-montserrat transition text-3xl font-bold mb-4 hover:scale-110"
    >
      ¡Bienvenido a <span class="text-amber-300">Celebdle</span>!
    </h1>

    <p class="font-montserrat text-lg text-center max-w-prose mb-8">
      Adivina la celebridad del día con pistas generadas por IA y compite contra
      tus amigos para ver quién acierta más rápido.
    </p>

    <div>
      <button
        @click="goToGame"
        class="font-montserrat transition bg-amber-300 px-6 py-3 text-black rounded-lg hover:bg-amber-300 hover:scale-110"
      >
        ¡Comienza a jugar!
      </button>
    </div>

    <p class="flex items-center font-montserrat text-neutral-400 mt-20">
      powered by
      <a target="_blank" href=" https://openai.com">
        <img
          class="w-16 ms-2 transition hover:scale-110"
          src="/img/openai.png"
          alt="OpenAI Logo"
        />
      </a>
    </p>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "LandingPage",
  setup() {
    const router = useRouter();
    const goToGame = () => {
      router.push("/play");
    };
    return { goToGame };
  },
};
</script>

<style scoped>
/* Estilos específicos para tu landing (si necesitas) */
</style>
