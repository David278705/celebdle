<!-- src/pages/GameView.vue -->
<template>
  <!-- Logo superior -->
  <div class="flex justify-center my-4">
    <a href="/">
      <img
        src="/img/celeb-dle-logo.png"
        alt="Celebdle Logo"
        class="w-40 transition hover:scale-110"
      />
    </a>
  </div>

  <!-- Tarjeta principal con tamaño fijo -->
  <div
    class="dark text-white p-4 bg-neutral-800 rounded-lg w-full sm:w-[600px] sm:min-h-[650px] mx-auto flex flex-col"
  >
    <h2 class="font-montserrat text-2xl font-bold mb-4 text-center">
      Adivina la celebridad
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
          <h3 class="bg-amber-300 text-black px-3 py-2 mb-2 select-none">
            Pista {{ i + 1 }}
            {{
              i + 1 <= 4
                ? "(Texto)"
                : i + 1 == 5
                ? "(Audio Entrevista)"
                : "(Imagen)"
            }}
          </h3>

          <!-- Distintas pistas según 'type' -->
          <p v-if="clueObj.type === 'text'">
            {{ clueObj.content }}
          </p>
          <audio
            v-else-if="clueObj.type === 'audio'"
            :src="clueObj.content"
            controls
            class="w-full"
          ></audio>
          <img
            v-else-if="clueObj.type === 'image'"
            :src="clueObj.content"
            style="image-rendering: pixelated; width: 256px; height: auto"
          />
        </div>
      </transition-group>

      <!-- Controles: Adivinar / Saltar -->
      <div v-if="!localFinished && revealedCluesCount < allClues.length">
        <input
          type="text"
          v-model="userGuess"
          class="text-black p-2 rounded mr-2 transition hover:scale-105"
          placeholder="¿Quién crees que es?"
          @keyup.enter="onGuess"
        />
        <button
          @click="onGuess"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2 transition hover:scale-105"
        >
          Adivinar
        </button>
        <button
          @click="onSkip"
          class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition hover:scale-105"
        >
          Saltar (desbloquear pista)
        </button>
      </div>

      <!-- Si revealedCluesCount == allClues.length, aún puede adivinar
             mientras !localFinished => "última pista" -->
      <div v-else-if="!localFinished && revealedCluesCount === allClues.length">
        <input
          type="text"
          v-model="userGuess"
          class="text-black p-2 rounded mr-2 transition hover:scale-105"
          placeholder="¿Quién crees que es?"
          @keyup.enter="onGuess"
        />
        <button
          @click="onGuess"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2 transition hover:scale-105"
        >
          Adivinar
        </button>
        <!-- Podrías tener un botón de "Rendirme" si quieres -->
      </div>

      <!-- RESULTADO final -->
      <div v-if="localFinished" class="mt-4">
        <template v-if="result === true">
          <p class="text-green-400">
            ¡Correcto! Era "{{ gameState.celebrityName }}"
          </p>
        </template>
        <template v-else-if="result === false">
          <p class="text-red-400">
            Se acabaron las pistas o adivinaste mal. La respuesta era "{{
              gameState.celebrityName
            }}".
          </p>
        </template>

        <!-- Muestra los attempts "guardados" -->
        <p>Te tomó {{ attempts }} intento(s)/acción(es).</p>
      </div>

      <!-- Al final, el tiempo faltante -->
      <div class="mt-4 text-center">
        <p class="text-amber-300">
          La próxima celebridad llegará en {{ timeLeft() }}.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { getOrCreateDailyGame, updateDailyGame } from "@/services/gameService";

const FAKE_USER_ID = "USER_ABC123";
const todayStr = new Date().toISOString().slice(0, 10);

export default {
  name: "GameView",
  setup() {
    const gameState = ref(null);

    // Iniciamos en 1 para mostrar la primera pista desde el principio
    const revealedCluesCount = ref(1);

    const userGuess = ref("");
    const result = ref(null); // true, false, o null
    const localFinished = ref(false);

    // attempts se guardará y restaurará en Firestore
    const attempts = ref(0);

    // Array para colorear cada pista
    const cluesColors = ref([]);

    onMounted(async () => {
      const data = await getOrCreateDailyGame(FAKE_USER_ID, todayStr);
      gameState.value = data;

      cluesColors.value = Array(allClues.value.length).fill("border-amber-300");
      attempts.value = data.attempts || 0;

      // Si no ha terminado, restauramos "revealedCluesCount" si existe
      if (!data.finished && data.revealedCluesCount !== undefined) {
        revealedCluesCount.value = data.revealedCluesCount;
      }

      if (data.finished) {
        // Se acabó el juego en sesiones anteriores
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
        content: gameState.value.celebrityImage,
      };
      return [...textClues, audioClue, imageClue];
    });

    // Pistas que se han desbloqueado
    const visibleClues = computed(() => {
      return allClues.value.slice(0, revealedCluesCount.value);
    });

    /**
     * Cada vez que el usuario adivine o salte,
     * sumamos attempts y lo guardamos en Firestore
     */
    async function updateAttemptsInFirestore() {
      attempts.value++;
      await updateDailyGame(FAKE_USER_ID, todayStr, {
        attempts: attempts.value,
      });
    }

    // Adivinar
    async function onGuess() {
      if (localFinished.value) return;

      // Si input vacío, no hacemos nada
      if (!userGuess.value.trim()) {
        return;
      }

      // Sumar attempts en Firestore
      await updateAttemptsInFirestore();

      const guessNormalized = userGuess.value.trim().toLowerCase();
      const realNameNormalized = gameState.value.celebrityName
        .trim()
        .toLowerCase();

      const correct =
        guessNormalized.includes(realNameNormalized) ||
        realNameNormalized.includes(guessNormalized);

      if (correct) {
        // Acierta => verde, fin
        result.value = true;
        localFinished.value = true;
        cluesColors.value = cluesColors.value.map(() => "border-green-500");

        revealedCluesCount.value = allClues.value.length;
        userGuess.value = "";

        // Guardar en Firestore: finished=true, guessedCorrectly=true
        await updateDailyGame(FAKE_USER_ID, todayStr, {
          finished: true,
          guessedCorrectly: true,
          attempts: attempts.value,
        });
        gameState.value.finished = true;
        // si gustas, gameState.value.guessedCorrectly = true
      } else {
        // Falla => coloreamos la pista actual en rojo
        const currentIndex = revealedCluesCount.value - 1;
        if (currentIndex >= 0 && currentIndex < cluesColors.value.length) {
          cluesColors.value[currentIndex] = "border-red-500";
        }

        // Si NO estamos en la última pista, se desbloquea la siguiente
        if (revealedCluesCount.value < allClues.value.length) {
          revealedCluesCount.value++;
          await updateDailyGame(FAKE_USER_ID, todayStr, {
            revealedCluesCount: revealedCluesCount.value,
            attempts: attempts.value,
          });
        } else {
          // Si ya estamos en la última y falló => game over
          result.value = false;
          localFinished.value = true;

          await updateDailyGame(FAKE_USER_ID, todayStr, {
            finished: true,
            guessedCorrectly: false,
            attempts: attempts.value,
          });
          gameState.value.finished = true;
        }
      }
    }

    // Saltar
    // Saltar => incrementamos revealedCluesCount
    async function onSkip() {
      if (localFinished.value) return;

      await updateAttemptsInFirestore(); // incrementa attempts y guarda

      const currentIndex = revealedCluesCount.value - 1;
      if (currentIndex >= 0 && currentIndex < cluesColors.value.length) {
        cluesColors.value[currentIndex] = "border-gray-500";
      }

      // Desbloquear siguiente pista
      if (revealedCluesCount.value < allClues.value.length) {
        revealedCluesCount.value++;
        // ¡Guardamos el nuevo revealedCluesCount en Firestore!
        await updateDailyGame(FAKE_USER_ID, todayStr, {
          revealedCluesCount: revealedCluesCount.value,
          attempts: attempts.value,
        });
      } else {
        // Si ya era la última => se queda sin pistas y sin acertar
        result.value = false;
        localFinished.value = true;
        await updateDailyGame(FAKE_USER_ID, todayStr, {
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
    };
  },
};
</script>

<style scoped>
/* Para que la tarjeta no cambie de tamaño, definimos ancho y alto fijos:
     w-[400px] min-h-[650px], y se ajusta contenido con flex y scroll interno. */

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
</style>
