<template>
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
        v-if="!finishedToday"
        @click="goToGame"
        class="font-montserrat transition bg-amber-300 px-6 py-3 text-black rounded-lg hover:bg-amber-300 hover:scale-110"
      >
        {{ t("landingPlayButton") }}
      </button>
      <!-- distribución vertical -->
      <div class="flex flex-col items-center space-x-2" v-else>
        <button
          disabled
          class="font-montserrat transition bg-amber-200 px-6 py-3 text-black rounded-lg"
        >
          {{ timer }}
        </button>

        <a
          class="text-amber-300 mt-4 transition hover:text-amber-400 hover:scale-110"
          href="/#/play"
        >
          {{ t("seeLastGame") }}</a
        >
      </div>
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

    <GoogleAd class="mt-4 w-full" />
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import i18n from "@/lang.js"; // Importamos tu archivo de traducciones
import GoogleAd from "../components/GoogleAd.vue";

export default {
  name: "LandingPage",
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

    const finishedToday = ref(false); // Determina si el usuario terminó la jornada
    const timer = ref(""); // Almacena el temporizador formateado
    let intervalId = null; // Referencia al intervalo para limpiar al desmontar

    // Función traductora
    const t = (key) => {
      const translations = i18n[props.lang] || i18n.es;
      return translations[key] || key;
    };

    const goToGame = () => {
      router.push("/play");
    };

    // Calcular tiempo restante hasta medianoche
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Próxima medianoche

      const msLeft = midnight - now;
      if (msLeft <= 0) {
        finishedToday.value = false; // Restablece para el nuevo día
        clearInterval(intervalId);
        return;
      }

      const padWithZeros = (number) => String(number).padStart(2, "0"); // Función para agregar ceros a la izquierda

      const hours = padWithZeros(Math.floor(msLeft / 3600000));
      const minutes = padWithZeros(Math.floor((msLeft % 3600000) / 60000));
      const seconds = padWithZeros(Math.floor((msLeft % 60000) / 1000));

      timer.value = `${hours}:${minutes}:${seconds}`; // Formato HH:MM:SS
    };

    onMounted(() => {
      // Simula si el usuario ha terminado hoy leyendo localStorage
      const storedData = localStorage.getItem("celebGameProgress");
      const now = new Date();
      const todayStr =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0");
      finishedToday.value =
        JSON.parse(storedData)?.finished &&
        JSON.parse(storedData).savedDate === todayStr;
      if (finishedToday.value) {
        calculateTimeLeft(); // Calcular el tiempo inicial
        intervalId = setInterval(calculateTimeLeft, 1000); // Actualizar cada segundo
      }
    });

    onUnmounted(() => {
      if (intervalId) clearInterval(intervalId); // Limpiar el intervalo
    });

    return {
      t,
      goToGame,
      finishedToday,
      timer,
    };
  },
};
</script>

<style scoped>
/* Estilos específicos para tu landing (si necesitas) */
</style>
