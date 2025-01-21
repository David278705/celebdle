<template>
  <!-- Logo superior -->

  <!-- <GoogleAd class="mt-4 w-full" /> -->

  <div class="flex justify-center">
    <a href="/">
      <img
        src="/img/celeb-dle-no-text-white.png"
        :alt="t('gameTitle')"
        class="w-20 transition hover:scale-110"
      />
    </a>
  </div>
  <em class="text-xs block text-center text-gray-400 italic mb-4">
    {{
      lang === "es"
        ? "Las pistas se crean utilizando el idioma seleccionado en el momento de su generación."
        : "Clues are created using the language selected at the time of their generation."
    }}
  </em>
  <!-- Ícono de pregunta arriba a la derecha -->
  <!-- Íconos arriba a la derecha -->
  <div
    style="z-index: 100"
    class="fixed top-4 right-4 flex items-center space-x-3 bg-neutral-700 rounded-xl p-2"
  >
    <!-- Ícono de pregunta -->
    <button
      class="text-amber-300 hover:text-amber-300 transition text-2xl p-2 rounded-full hover:scale-110 hover:text-white bg-neutral-800"
      @click="openRulesModal"
      aria-label="Mostrar reglas"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0
                 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442
                 -.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0
                 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
        />
      </svg>
    </button>

    <!-- Ícono de estadísticas -->
    <button
      id="StatsButton"
      class="text-amber-300 hover:text-amber-300 transition text-2xl p-2 rounded-full hover:scale-110 hover:text-white bg-neutral-800"
      @click="openStatsModal"
      aria-label="Mostrar estadísticas"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 3v18h16.5V3m-12 9v6m4-10v10m4-6v6"
        />
      </svg>
    </button>
  </div>

  <transition name="fade-in-up" appear>
    <!-- Tarjeta principal con tamaño fijo -->
    <div
      id="GameScreen"
      class="dark text-white p-4 bg-neutral-800 rounded-lg w-full sm:w-[600px] mx-auto flex flex-col"
    >
      <h2 class="font-montserrat text-2xl font-bold text-center mb-4">
        {{ t("gameTitle") }}
      </h2>

      <!-- Cargando estado de juego -->
      <div class="flex justify-center flex-1" v-if="!gameState">
        <span class="relative flex h-5 w-5">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"
          ></span>
          <span
            class="relative inline-flex rounded-full h-5 w-5 bg-amber-300"
          ></span>
        </span>
      </div>

      <!-- Juego principal una vez cargado -->
      <div v-else class="flex-1 flex flex-col">
        <!-- LISTA DE PISTAS con animación -->
        <transition-group
          name="collapse"
          tag="div"
          class="mb-4 flex-1 overflow-auto"
        >
          <!-- Recorremos solo las pistas "visibles" (hasta revealedCluesCount) -->
          <div
            v-for="(clueObj, i) in visibleClues"
            :key="i"
            :class="[
              'mb-2',
              'border',
              'rounded',
              'overflow-hidden',
              'p-2',
              'bg-neutral-700',
              cluesColors[i],
            ]"
          >
            <!-- Etiqueta de la pista dinámicamente traducida -->
            <h3
              class="font-montserrat bg-amber-300 text-black px-3 py-2 mb-2 select-none"
            >
              {{ t("clueLabel", i) }}
            </h3>

            <!-- Distintas pistas según 'type' -->
            <p class="font-montserrat" v-if="clueObj.type === 'text'">
              {{ clueObj.content }}
            </p>
            <audio
              v-else-if="clueObj.type === 'audio'"
              :src="clueObj.content"
              controls
              class="w-full"
            ></audio>
            <div
              class="flex justify-center"
              v-else-if="clueObj.type === 'image' && imageUrl"
            >
              <img
                :src="imageUrl"
                id="celebrityImage"
                alt="Imagen de la celebridad"
                style="
                  image-rendering: pixelated;
                  width: 256px;
                  height: auto;
                  filter: blur(3px);
                "
              />
            </div>
            <div v-else>
              <div class="flex items-center justify-center">
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </transition-group>

        <!-- Controles: Adivinar / Saltar -->
        <div v-if="!localFinished && revealedCluesCount < allClues.length">
          <div class="relative">
            <input
              type="text"
              v-model="userGuess"
              class="font-montserrat text-black p-2 rounded w-full"
              :placeholder="t('placeholderGuess')"
              @keyup.enter="onGuess"
            />
            <!-- Sugerencias -->
            <ul
              v-if="suggestions?.length"
              class="absolute bg-neutral-700 text-white w-full border border-gray-300 rounded mt-1 z-50"
            >
              <li
                v-for="(sugg, idx) in suggestions"
                :key="idx"
                class="px-2 py-1 hover:bg-neutral-600 cursor-pointer"
                @click="selectSuggestion(sugg)"
              >
                {{ sugg }}
              </li>
            </ul>
          </div>

          <div class="mt-3">
            <!-- centrado -->
            <button
              @click="onGuess"
              :disabled="isGuessing"
              class="font-montserrat bg-green-600 text-white px-4 py-2 rounded mr-2 transition hover:scale-105"
            >
              <span v-if="!isGuessing">{{ t("guessButton") }}</span>
              <span class="flex items-center justify-center" v-else>
                {{ t("guessButton") }}
                <span class="relative flex h-5 w-5 ms-2">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-5 w-5 bg-white"
                  ></span>
                </span>
              </span>
            </button>

            <button
              @click="onSkip"
              class="font-montserrat bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition hover:scale-105"
            >
              {{ t("skipButton") }}
            </button>
          </div>
        </div>

        <!-- Si revealedCluesCount == allClues.length, aún puede adivinar
             mientras !localFinished => "última pista" -->
        <div
          v-else-if="!localFinished && revealedCluesCount === allClues.length"
        >
          <div class="relative">
            <input
              type="text"
              v-model="userGuess"
              class="font-montserrat text-black p-2 rounded w-full"
              :placeholder="t('placeholderGuess')"
              @keyup.enter="onGuess"
            />
            <!-- Sugerencias -->
            <ul
              v-if="suggestions?.length"
              class="absolute bg-neutral-700 text-white w-full border border-gray-300 rounded mt-1 z-50"
            >
              <li
                v-for="(sugg, idx) in suggestions"
                :key="idx"
                class="px-2 py-1 hover:bg-neutral-600 cursor-pointer"
                @click="selectSuggestion(sugg)"
              >
                {{ sugg }}
              </li>
            </ul>
          </div>

          <button
            @click="onGuess"
            :disabled="isGuessing"
            class="font-montserrat bg-green-600 text-white px-4 py-2 rounded mr-2 transition hover:scale-105 mt-2"
          >
            <span v-if="!isGuessing">{{ t("guessButton") }}</span>
            <span class="flex items-center justify-center" v-else>
              {{ t("guessButton") }}
              <span class="relative flex h-5 w-5 ms-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-5 w-5 bg-white"
                ></span>
              </span>
            </span>
          </button>
        </div>

        <!-- RESULTADO final -->
        <div v-if="localFinished" class="mt-4">
          <template v-if="result === true">
            <p class="font-montserrat text-green-400">
              {{ t("correctAnswer", gameState.celebrityName) }}
            </p>
          </template>
          <template v-else-if="result === false">
            <p class="font-montserrat text-red-400">
              {{ t("wrongAnswer", gameState.celebrityName) }}
            </p>
          </template>

          <!-- Muestra los attempts -->
          <p class="font-montserrat">{{ t("attemptsLabel", attempts) }}</p>
        </div>

        <!-- Al final, el tiempo faltante -->
        <div v-if="localFinished" class="mt-4 text-center">
          <p class="font-montserrat text-green-300">
            {{ t("nextCelebrityTimer", timeLeft()) }}
          </p>
        </div>
      </div>
    </div>
  </transition>

  <!-- Modal de Reglas (overlay) -->
  <transition name="fade">
    <div
      v-if="showRulesModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeRulesModal"
    >
      <div
        class="bg-neutral-700 text-white p-6 px-3 rounded-lg shadow-md w-11/12 sm:w-96"
        @click.stop
      >
        <!-- Título del modal -->
        <h2 class="font-montserrat text-2xl font-bold mb-4 text-center">
          {{ t("rulesModalTitle") }}
        </h2>

        <!-- Lista de reglas traducidas -->
        <ul class="font-montserrat space-y-2" style="padding: 0">
          <li
            class="bg-neutral-800 p-2 rounded-lg"
            v-for="(rule, idx) in t('rulesList')"
            :key="idx"
            v-html="rule"
          ></li>
        </ul>

        <!-- Botón de cierre -->
        <div class="flex justify-center mt-6">
          <button
            class="font-montserrat bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
            @click="closeRulesModal"
          >
            {{ t("closeButton") }}
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- <GoogleAd class="mt-4 w-full" /> -->

  <!-- Statistics Modal -->
  <transition name="fade">
    <div
      v-if="showStatsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeStatsModal"
    >
      <div
        class="bg-neutral-700 text-white p-6 rounded-lg shadow-md w-11/12 sm:w-96"
        @click.stop
      >
        <h2 class="text-2xl font-bold mb-4 text-center">
          {{ t("statsTitle") }}
        </h2>

        <!-- Distribution of results (1..6, X) -->
        <div class="space-y-2 mb-4">
          <div
            v-for="(count, index) in stats.distribution"
            :key="index"
            class="text-sm"
          >
            <div class="flex items-center">
              <span class="w-6 text-right mr-2">
                <!-- index 1..6, index 0 = 'X' -->
                <template v-if="index === 0">{{ t("statsXLabel") }}</template>
                <template v-else>{{ index }}</template>
              </span>
              <div class="flex-1 bg-neutral-600 h-4 rounded relative mr-2">
                <!-- Dynamic width bar, based on max distribution -->
                <div
                  class="bg-amber-300 h-4 rounded-l"
                  :style="{ width: getDistributionWidth(count) + '%' }"
                ></div>
              </div>
              <span class="w-6 text-right">
                {{ count }}
              </span>
            </div>
          </div>
        </div>

        <!-- Summary (Found, Current Streak, Max Streak) -->
        <div class="flex justify-around items-center mb-4">
          <div class="text-center">
            <p class="text-xl font-bold">
              <!-- Wins / Played (x%) -->
              {{ stats.wins }}/{{ stats.played }} ({{ getWinPercentage() }}%)
            </p>
            <p class="text-sm text-neutral-400">{{ t("statsFoundLabel") }}</p>
          </div>
          <div class="text-center">
            <p class="text-xl font-bold">{{ stats.currentStreak }}</p>
            <p class="text-sm text-neutral-400">
              {{ t("statsCurrentStreakLabel") }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-xl font-bold">{{ stats.maxStreak }}</p>
            <p class="text-sm text-neutral-400">
              {{ t("statsMaxStreakLabel") }}
            </p>
          </div>
        </div>

        <!-- Close button -->
        <div class="flex flex-col space-y-2 mt-4">
          <button
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            @click="closeStatsModal"
          >
            {{ t("statsCloseButton") }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { getCelebrityOfToday } from "@/services/pickCelebrityService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import i18n from "@/lang.js"; // <-- importamos el objeto de traducciones
import GoogleAd from "../components/GoogleAd.vue";

export default {
  name: "GameView",
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
    const imageUrl = ref("");

    const showRulesModal = ref(false);
    const showStatsModal = ref(false);

    const gameState = ref(null);

    const revealedCluesCount = ref(1);
    const userGuess = ref("");
    const suggestions = ref([]); // array de strings para mostrar

    const result = ref(null); // true, false, o null
    const localFinished = ref(false);
    const attempts = ref(0);
    const cluesColors = ref([]);
    const isGuessing = ref(false);

    // Stats en localStorage
    const stats = ref({
      played: 0,
      wins: 0,
      distribution: [0, 0, 0, 0, 0, 0, 0], // 0 -> X, 1..6 -> tries
      currentStreak: 0,
      maxStreak: 0,
      lastPlayed: null,
    });

    // Cargar/guardar localStorage
    async function loadFromLocalStorage() {
      const stored = localStorage.getItem("celebGameProgress");
      if (stored) {
        const data = JSON.parse(stored);

        // Obtener la fecha de hoy
        const now = new Date();
        const todayStr =
          now.getFullYear() +
          "-" +
          String(now.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(now.getDate()).padStart(2, "0");
        // Si la fecha guardada no coincide con hoy, lo descartamos
        if (data.savedDate !== todayStr) {
          // Borramos
          localStorage.removeItem("celebGameProgress");
          return null; // Salimos sin asignar nada a gameState
        }

        // Caso contrario, la partida corresponde al día actual => la restauramos
        gameState.value = data;
        localFinished.value = data.finished || false;
        revealedCluesCount.value = data.revealedCluesCount || 1;
        attempts.value = data.attempts || 0;
        result.value = data.result ?? null;

        return data;
      }
      return null;
    }

    // Al seleccionar una sugerencia:
    function selectSuggestion(name) {
      userGuess.value = name;
      setTimeout(() => {
        suggestions.value = [];
      }, 200);
    }
    function saveToLocalStorage() {
      if (!gameState.value) return;
      localStorage.setItem(
        "celebGameProgress",
        JSON.stringify({
          ...gameState.value,
          finished: localFinished.value,
          revealedCluesCount: revealedCluesCount.value,
          attempts: attempts.value,
          result: result.value,
        })
      );
    }

    // Función auxiliar para traducir
    const t = (key, param = null) => {
      const translations = i18n[props.lang] || i18n.es; // fallback a es
      // Si en las traducciones viene una función (por ej. clueLabel, correctAnswer, etc.)
      // la ejecutamos pasando "param". Si no, devolvemos la cadena.
      if (typeof translations[key] === "function") {
        return translations[key](param);
      }
      // Si en cambio es un array (por ejemplo rulesList)
      if (Array.isArray(translations[key])) {
        return translations[key];
      }
      // O bien es un string
      return translations[key] || key;
    };

    const fetchCelebrityImage = async (celebrityName) => {
      const apiUrl = "https://en.wikipedia.org/w/api.php";
      const params = new URLSearchParams({
        action: "query",
        titles: celebrityName,
        prop: "pageimages",
        format: "json",
        pithumbsize: 100,
        origin: "*", // Importante para evitar problemas de CORS.
      });

      try {
        const response = await fetch(`${apiUrl}?${params}`);
        const data = await response.json();
        if (data.query?.pages) {
          const page = Object.values(data.query.pages)[0]; // Primer resultado
          if (page.thumbnail?.source) {
            imageUrl.value = page.thumbnail.source; // URL de la imagen
          } else {
            console.error(
              "No se encontró imagen para la celebridad:",
              celebrityName
            );
            imageUrl.value = ""; // Vaciar si no hay imagen
          }
        } else {
          console.error(
            "No se encontraron resultados para la celebridad:",
            celebrityName
          );
          imageUrl.value = ""; // Vaciar si no hay resultados
        }
      } catch (error) {
        console.error("Error al obtener la imagen de MediaWiki:", error);
        imageUrl.value = ""; // Vaciar en caso de error
      }
    };

    // Observa los cambios en gameState.celebrityName y realiza la búsqueda cuando cambie
    watch(
      () => gameState.celebrityName,
      (newName) => {
        if (newName) {
          fetchCelebrityImage(newName);
        }
      },
      { immediate: true }
    );

    // ...
    watch(
      () => userGuess.value,
      async (newVal, oldVal) => {
        const term = newVal.trim().toLowerCase();

        // Si userGuess es vacío => no cargamos nada
        if (!term) {
          suggestions.value = [];
          return;
        }

        // Si la diferencia se debe a que acabamos de hacer selectSuggestion()
        // y ya vaciamos 'suggestions', podemos chequear:
        if (!oldVal || oldVal.toLowerCase() !== term) {
          await loadSuggestions();
        }
      }
    );

    watch([imageUrl, revealedCluesCount], () => {
      const gameScreen = document.getElementById("GameScreen");

      if (gameScreen) {
        setTimeout(() => {
          // Registro del tiempo de inicio
          const startTime = Date.now();
          const maxDuration = 2000; // 3 segundos en milisegundos

          const scrollToBottom = () => {
            const atBottom =
              Math.abs(
                gameScreen.scrollHeight -
                  gameScreen.scrollTop -
                  gameScreen.clientHeight
              ) < 1; // Ajusta la tolerancia si es necesario

            const generalAtBottom =
              Math.abs(window.innerHeight - window.scrollY) < 1;
            const imageElement = document.querySelector("#celebrityImage"); // Ajusta el selector si es necesario

            if (
              !atBottom || // No está en el fondo
              !imageUrl || // No hay imageUrl
              (revealedCluesCount.value > 5 && // Si los clues revelados son más de 5
                (!imageElement || !imageElement.complete)) // Se aplica para el elemento de la imagen
            ) {
              gameScreen.scrollTo({
                top: gameScreen.scrollHeight,
                behavior: "smooth",
              });

              // Esperar 100ms y volver a comprobar
              setTimeout(scrollToBottom, 100);
            }

            if (
              !generalAtBottom || // No está en el fondo
              !imageUrl || // No hay imageUrl
              (revealedCluesCount.value > 5 && // Si los clues revelados son más de 5
                (!imageElement || !imageElement.complete)) // Se aplica para el elemento de la imagen
            ) {
              // bajar tambien la pagina en general
              window.scrollTo({
                top: window.innerHeight,
                behavior: "smooth",
              });
            }
          };

          // Iniciar el bucle
          scrollToBottom();
        }, 200);
      }
    });

    // Funciones para abrir/cerrar el modal
    const openRulesModal = () => {
      showRulesModal.value = true;
    };
    const closeRulesModal = () => {
      showRulesModal.value = false;
    };

    // Stats modal

    const openStatsModal = () => {
      loadStats();
      showStatsModal.value = true;
    };
    const closeStatsModal = () => (showStatsModal.value = false);

    onMounted(async () => {
      // 1) Carga estadísticas desde localStorage (si usas stats modal)
      loadStats();

      // 2) Intenta cargar el progreso local del juego (si existe)
      const response = await loadFromLocalStorage();

      if (!response) {
        const now = new Date();
        const todayStr =
          now.getFullYear() +
          "-" +
          String(now.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(now.getDate()).padStart(2, "0");

        // 3) Si no había progreso, consultamos la celebridad del día en dailySelection
        const todayCeleb = await getCelebrityOfToday();
        if (!todayCeleb) {
          console.warn("There is no celebrity for today.");
          return; // o manejar de otra forma
        }
        // 4) Creamos un estado de juego inicial
        gameState.value = {
          celebrityName: todayCeleb.name,
          audioUrl: todayCeleb.audioUrl,
          // Asumiendo que en dailySelection guardaste un array de clues,
          // o si no, usas un default:
          clues:
            props.lang === "es" ? todayCeleb.clues_es : todayCeleb.clues_en,
          finished: false,
          guessedCorrectly: false,
          revealedCluesCount: 1,
          attempts: 0,

          savedDate: todayStr,
        };
        // Ajustamos refs locales
        localFinished.value = false;
        revealedCluesCount.value = 1;
        attempts.value = 0;
        result.value = null;

        // 5) Guardar el nuevo estado en localStorage
        saveToLocalStorage();
      } else {
        // 6) Si sí había progreso local, refleja en las refs
        localFinished.value = gameState.value.finished || false;
        revealedCluesCount.value = gameState.value.revealedCluesCount || 1;
        attempts.value = gameState.value.attempts || 0;
        result.value = gameState.value.result ?? null;

        if (gameState.value.finished) {
          document.getElementById("StatsButton").click();
        }
      }

      // 7) Prepara los estilos de color para las pistas
      cluesColors.value = Array(allClues.value.length).fill("border-amber-300");

      // Si el juego ya está terminado, colorea según acierto/fallo
      if (localFinished.value) {
        revealedCluesCount.value = allClues.value.length;
        if (result.value === true) {
          cluesColors.value = cluesColors.value.map(() => "border-green-500");
        } else {
          cluesColors.value = cluesColors.value.map(() => "border-red-500");
        }
      }

      // 8) Tras un breve delay, obtenemos la imagen de la celebridad (si se requiere)
      setTimeout(() => {
        if (gameState.value?.celebrityName) {
          fetchCelebrityImage(gameState.value.celebrityName);
        }
      }, 500);
    });

    /**
     * allClues: 6 pistas en orden:
     * [0..3] => textClues (4),
     * [4] => audio,
     * [5] => imagen
     */
    const allClues = computed(() => {
      if (!gameState.value) return [];
      const textClues = (gameState.value.clues || []).map((c) => ({
        type: "text",
        content: c,
      }));
      const audioClue = {
        type: "audio",
        content: gameState.value.audioUrl,
      };
      const imageClue = {
        type: "image",
        content: imageUrl.value,
      };
      return [...textClues, audioClue, imageClue];
    });

    // Pistas que se han desbloqueado
    const visibleClues = computed(() => {
      return allClues.value.slice(0, revealedCluesCount.value);
    });

    function loadStats() {
      const stored = localStorage.getItem("celebStats");
      if (stored) {
        try {
          stats.value = JSON.parse(stored);
        } catch (e) {
          console.error("Error al parsear stats:", e);
        }
      }
    }

    function saveStats() {
      localStorage.setItem("celebStats", JSON.stringify(stats.value));
    }

    function updateStatsOnWin(tryNumber) {
      // tryNumber va de 1..6
      stats.value.played++;
      stats.value.wins++;
      stats.value.distribution[tryNumber]++;
      // Racha
      const today = new Date().toISOString().slice(0, 10);
      if (stats.value.lastPlayed === today) {
        // Si ya jugó hoy, no cambiar racha
        // (o maneja tu lógica si quieres permitir reinicio)
      } else {
        stats.value.lastPlayed = today;
        stats.value.currentStreak++;
        if (stats.value.currentStreak > stats.value.maxStreak) {
          stats.value.maxStreak = stats.value.currentStreak;
        }
      }
      saveStats();
    }

    function updateStatsOnLose() {
      stats.value.played++;
      // index 0 => X
      stats.value.distribution[0]++;
      // Resetea racha
      const today = new Date().toISOString().slice(0, 10);
      if (stats.value.lastPlayed !== today) {
        stats.value.currentStreak = 0;
        stats.value.lastPlayed = today;
      }
      saveStats();
    }

    // Helpers para la UI en modal
    function getWinPercentage() {
      if (stats.value.played === 0) return 0;
      return Math.round((stats.value.wins / stats.value.played) * 100);
    }

    function getDistributionWidth(count) {
      const maxVal = Math.max(...stats.value.distribution);
      if (maxVal === 0) return 0;
      return (count / maxVal) * 100;
    }

    // Adivinar
    // onGuess => sin Firestore, solo local
    async function onGuess() {
      if (!gameState.value || localFinished.value) return;
      if (!userGuess.value.trim()) return;

      attempts.value++;
      // check if correct
      const guessNormalized = userGuess.value.trim().toLowerCase();
      const realNameNormalized = gameState.value.celebrityName
        .trim()
        .toLowerCase();
      const correct =
        guessNormalized.includes(realNameNormalized) ||
        realNameNormalized.includes(guessNormalized);

      if (correct) {
        result.value = true;
        localFinished.value = true;
        // p.ej. revealedCluesCount = allClues.length
        revealedCluesCount.value = gameState.value.clues.length + 2; // Ej. 6

        updateStatsOnWin(attempts.value);
      } else {
        // falló
        if (revealedCluesCount.value < gameState.value.clues.length + 2) {
          revealedCluesCount.value++;
        } else {
          // se acabó
          result.value = false;
          localFinished.value = true;
        }
        updateStatsOnLose();
      }
      saveToLocalStorage();
      userGuess.value = "";
    }

    // onSkip => incrementa revealedCluesCount y guarda local
    async function onSkip() {
      if (!gameState.value || localFinished.value) return;
      attempts.value++;
      if (revealedCluesCount.value < gameState.value.clues.length + 2) {
        revealedCluesCount.value++;
      } else {
        localFinished.value = true;
        result.value = false;
      }
      saveToLocalStorage();
    }

    // Saltar
    function onSkip() {
      // Si ya terminó el juego, no hacer nada
      if (localFinished.value) return;

      // Incrementamos intentos
      attempts.value++;

      // Marcar pista actual como "saltada"
      const currentIndex = revealedCluesCount.value - 1;
      if (currentIndex >= 0 && currentIndex < cluesColors.value.length) {
        cluesColors.value[currentIndex] = "border-gray-500";
      }

      // Desbloqueamos la siguiente pista, si queda
      if (revealedCluesCount.value < allClues.value.length) {
        revealedCluesCount.value++;
      } else {
        // Ya no hay más pistas => finaliza el juego
        result.value = false;
        localFinished.value = true;
        // Lógica de stats => se cuenta como no adivinó
        updateStatsOnLose();
      }

      // Guardar progreso en localStorage
      saveToLocalStorage();
    }

    // Método para cargar sugerencias (filtra por name)
    async function loadSuggestions() {
      const term = userGuess.value.trim().toLowerCase();
      if (!term) {
        suggestions.value = [];
        return;
      }

      // Por simplicidad, asumiendo un query "where name >= term" or similar
      // O si tienes un índice para búsqueda.
      // A falta de un "startAt" / "endAt", haremos un filtrado manual en el cliente.

      // Traemos todos (o muchos) y luego filtramos. O implementa un “startAt” / “endAt” si usas “orderBy”.
      const snapshot = await getDocs(collection(db, "celebrities"));
      let tempList = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.name.toLowerCase().includes(term)) {
          tempList.push(data.name);
        }
      });

      // Tomar solo las 6 coincidencias
      suggestions.value = tempList.slice(0, 6);
    }

    // Tiempo hasta medianoche local
    function timeLeft() {
      const now = new Date();
      const tomorrowMidnight = new Date(now);
      tomorrowMidnight.setDate(now.getDate() + 1);
      tomorrowMidnight.setHours(0, 0, 0, 0);

      const msLeft = tomorrowMidnight - now;
      if (msLeft <= 0) return "0 horas";
      const hours = Math.floor(msLeft / 3600000);
      const minutes = Math.floor((msLeft % 3600000) / 60000);
      return `${hours}h ${minutes}m`;
    }

    return {
      showRulesModal,
      gameState,
      revealedCluesCount,
      userGuess,
      result,
      localFinished,
      attempts,
      cluesColors,

      // Computed
      allClues,
      visibleClues,

      // Methods
      onGuess,
      onSkip,
      timeLeft,
      openRulesModal,
      closeRulesModal,
      imageUrl,
      isGuessing,
      // Función traductora
      t,

      showStatsModal,
      openStatsModal,
      closeStatsModal,

      stats,
      loadStats,
      saveStats,
      getWinPercentage,
      getDistributionWidth,
      suggestions,
      selectSuggestion,
    };
  },
};
</script>

<style scoped>
/* Transiciones para <transition-group name="collapse"> */
.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  max-height: 500px;
  opacity: 1;
}
.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 1s ease, opacity 1s ease;
}

/* Ejemplo de animación “fade in + desplazamiento hacia arriba” */
.fade-in-up-enter-from,
.fade-in-up-appear-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-in-up-enter-to,
.fade-in-up-appear-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-in-up-enter-active,
.fade-in-up-appear-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-in-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.fade-in-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.fade-in-up-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

/* Transición para el overlay del modal */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
</style>
