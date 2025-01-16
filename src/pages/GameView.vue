<template>
  <!-- Logo superior -->
  <div class="flex justify-center">
    <a href="/">
      <img
        src="/img/celeb-dle-no-text-white.png"
        :alt="t('gameTitle')"
        class="w-20 transition hover:scale-110"
      />
    </a>
  </div>

  <transition name="fade-in-up" appear>
    <!-- Tarjeta principal con tamaño fijo -->
    <div
      style="overflow-y: scroll"
      class="dark text-white p-4 bg-neutral-800 rounded-lg w-full sm:w-[600px] min-h-[70vh] max-h-[70vh] mx-auto flex flex-col"
    >
      <!-- Ícono de pregunta arriba a la derecha -->
      <button
        class="font-montserrat absolute top-4 right-4 text-amber-300 hover:text-amber-300 transition text-2xl p-2 rounded-full transition hover:scale-110 hover:text-white bg-neutral-800"
        @click="openRulesModal"
        :aria-label="t('questionIconAlt')"
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
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
          />
        </svg>
      </button>

      <h2 class="font-montserrat text-2xl font-bold mb-4 text-center">
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
          <div>
            <input
              type="text"
              v-model="userGuess"
              class="font-montserrat text-black p-2 rounded mr-2 transition hover:scale-95 w-full"
              :placeholder="t('placeholderGuess')"
              @keyup.enter="onGuess"
            />
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
          <div>
            <input
              type="text"
              v-model="userGuess"
              class="font-montserrat text-black p-2 rounded mr-2 transition hover:scale-95 w-full"
              :placeholder="t('placeholderGuess')"
              @keyup.enter="onGuess"
            />
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
        class="bg-neutral-700 text-white p-6 rounded-lg shadow-md w-11/12 sm:w-96"
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
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { getOrCreateDailyGame, updateDailyGame } from "@/services/gameService";
import i18n from "@/lang.js"; // <-- importamos el objeto de traducciones

const today = new Date();
const offsetDate = new Date(today.getTime());
const todayStr = offsetDate.toISOString().slice(0, 10);

export default {
  name: "GameView",
  // Recibimos el idioma como prop, por defecto "es"
  props: {
    lang: {
      type: String,
      default: "es",
    },
  },
  setup(props) {
    const imageUrl = ref("");

    const showRulesModal = ref(false);
    const gameState = ref(null);
    const USER_PLAYER_ID = ref(null);

    const revealedCluesCount = ref(1);
    const userGuess = ref("");
    const result = ref(null); // true, false, o null
    const localFinished = ref(false);
    const attempts = ref(0);
    const cluesColors = ref([]);
    const isGuessing = ref(false);

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
      const query = encodeURIComponent(celebrityName);
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

    // Funciones para abrir/cerrar el modal
    const openRulesModal = () => {
      showRulesModal.value = true;
    };
    const closeRulesModal = () => {
      showRulesModal.value = false;
    };

    onMounted(async () => {
      const userIP = await getPublicIP();
      USER_PLAYER_ID.value = `USER_${userIP}`;
      const data = await getOrCreateDailyGame(
        USER_PLAYER_ID.value,
        todayStr,
        props.lang
      );

      gameState.value = data;
      cluesColors.value = Array(allClues.value.length).fill("border-amber-300");
      attempts.value = data.attempts || 0;

      // Si no ha terminado, restauramos "revealedCluesCount" si existe
      if (!data.finished && data.revealedCluesCount !== undefined) {
        revealedCluesCount.value = data.revealedCluesCount;
      }

      // Si está terminado, ajustamos estado
      if (data.finished) {
        revealedCluesCount.value = allClues.value.length;
        localFinished.value = true;
        if (data.guessedCorrectly) {
          result.value = true;
          cluesColors.value = cluesColors.value.map(() => "border-green-500");
        } else {
          result.value = false;
          cluesColors.value = cluesColors.value.map(() => "border-red-500");
        }
      }

      setTimeout(() => {
        if (gameState.value.celebrityName) {
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
        content: gameState.value.celebrityAudio,
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

    // Actualizar attempts en Firestore
    async function updateAttemptsInFirestore() {
      attempts.value++;
      await updateDailyGame(USER_PLAYER_ID.value, todayStr, {
        attempts: attempts.value,
      });
    }

    async function getPublicIP() {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error("Error al obtener la IP pública:", error);
        return null;
      }
    }

    // Adivinar
    async function onGuess() {
      if (localFinished.value || isGuessing.value) return;
      if (!userGuess.value.trim()) {
        return;
      }

      isGuessing.value = true; // Bloquea nuevas ejecuciones
      try {
        await updateAttemptsInFirestore();

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
          cluesColors.value = cluesColors.value.map(() => "border-green-500");

          revealedCluesCount.value = allClues.value.length;
          userGuess.value = "";

          await updateDailyGame(USER_PLAYER_ID.value, todayStr, {
            finished: true,
            guessedCorrectly: true,
            attempts: attempts.value,
          });
          gameState.value.finished = true;
        } else {
          const currentIndex = revealedCluesCount.value - 1;
          if (currentIndex >= 0 && currentIndex < cluesColors.value.length) {
            cluesColors.value[currentIndex] = "border-red-500";
          }

          if (revealedCluesCount.value < allClues.value.length) {
            revealedCluesCount.value++;
            await updateDailyGame(USER_PLAYER_ID.value, todayStr, {
              revealedCluesCount: revealedCluesCount.value,
              attempts: attempts.value,
            });
          } else {
            result.value = false;
            localFinished.value = true;

            await updateDailyGame(USER_PLAYER_ID.value, todayStr, {
              finished: true,
              guessedCorrectly: false,
              attempts: attempts.value,
            });
            gameState.value.finished = true;
          }
          userGuess.value = "";
        }
      } catch (error) {
        console.error("Error en la función onGuess:", error);
      } finally {
        isGuessing.value = false; // Permite nuevas ejecuciones
      }
    }

    // Saltar
    async function onSkip() {
      if (localFinished.value) return;

      await updateAttemptsInFirestore(); // incrementa attempts

      const currentIndex = revealedCluesCount.value - 1;
      if (currentIndex >= 0 && currentIndex < cluesColors.value.length) {
        cluesColors.value[currentIndex] = "border-gray-500";
      }

      // Desbloquear siguiente pista
      if (revealedCluesCount.value < allClues.value.length) {
        revealedCluesCount.value++;
        await updateDailyGame(USER_PLAYER_ID.value, todayStr, {
          revealedCluesCount: revealedCluesCount.value,
          attempts: attempts.value,
        });
      } else {
        // Si ya era la última => se queda sin pistas
        result.value = false;
        localFinished.value = true;
        await updateDailyGame(USER_PLAYER_ID.value, todayStr, {
          finished: true,
          guessedCorrectly: false,
          attempts: attempts.value,
          revealedCluesCount: revealedCluesCount.value,
        });
        gameState.value.finished = true;
      }
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
