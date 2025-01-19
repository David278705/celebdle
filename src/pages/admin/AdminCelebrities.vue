<template>
  <div class="p-4 max-w-4xl mx-auto">
    <!-- Mostramos quién es la celebridad de HOY (si la hay) -->
    <div v-if="todayCeleb" class="mb-6 text-center">
      <h2 class="text-2xl font-bold text-amber-400">
        Celebridad de hoy: {{ todayCeleb.name }}
      </h2>
    </div>

    <h1 class="text-2xl font-bold mb-4">Administrar Celebridades</h1>

    <!-- Sección de formulario y búsqueda -->
    <div class="border border-gray-600 p-4 rounded mb-6">
      <h2 class="text-xl font-bold mb-2">
        {{ isEditing ? "Editar Celebridad" : "Añadir Celebridad" }}
      </h2>
      <form @submit.prevent="saveCeleb" class="space-y-4">
        <div>
          <label class="block font-semibold mb-1">Nombre</label>
          <input
            type="text"
            v-model="name"
            class="w-full border border-gray-500 rounded p-2"
            required
          />
        </div>

        <div>
          <label class="block font-semibold mb-1">Audio URL</label>
          <input
            type="text"
            v-model="audioUrl"
            class="w-full border border-gray-500 rounded p-2"
            required
          />
        </div>

        <div class="flex items-center space-x-2">
          <button
            type="submit"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {{ isEditing ? "Actualizar" : "Guardar" }}
          </button>
          <button
            type="button"
            v-if="isEditing"
            @click="cancelEditing"
            class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
        </div>
      </form>

      <!-- Buscador -->
      <div class="mt-6">
        <label class="block font-semibold mb-1">Buscar</label>
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Filtrar por nombre..."
          class="w-full border border-gray-500 rounded p-2"
        />
      </div>
    </div>

    <!-- Opciones de orden -->
    <div class="flex items-center space-x-4 mb-2">
      <span class="font-semibold">Ordenar por:</span>
      <button
        class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
        @click="sortBy = 'unselectedFirst'"
      >
        Sin elegir primero / antigüedad
      </button>
    </div>

    <!-- Tabla de celebridades -->
    <table class="w-full border border-gray-600 text-sm mb-6">
      <thead class="bg-gray-700 text-white">
        <tr>
          <th class="py-2 px-2 text-left">Nombre</th>
          <th class="py-2 px-2 text-left">Audio URL</th>
          <th class="py-2 px-2 text-left">Última Vez Elegida</th>
          <th class="py-2 px-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="celeb in filteredAndSortedCelebs"
          :key="celeb.id"
          class="border-b border-gray-600"
        >
          <td class="py-2 px-2">{{ celeb.name }}</td>
          <td class="py-2 px-2 break-all">{{ celeb.audioUrl }}</td>
          <td class="py-2 px-2">
            <span v-if="celeb.lastSelectedDate">
              {{ celeb.lastSelectedDate }}
            </span>
            <span v-else class="text-gray-400">-</span>
          </td>
          <td
            class="py-2 px-2 flex flex-col sm:flex-row items-center sm:justify-center space-y-2 sm:space-y-0 sm:space-x-2"
          >
            <button
              class="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm"
              @click="editCeleb(celeb)"
            >
              Editar
            </button>
            <button
              class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm"
              @click="deleteCeleb(celeb.id)"
            >
              Eliminar
            </button>

            <!-- Elegir la fecha y guardarla en dailySelection -->
            <div class="flex items-center space-x-1">
              <input
                type="date"
                v-model="celeb.chosenDate"
                class="border rounded text-black text-sm"
              />
              <button
                class="bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700 text-sm"
                @click="chooseAsCelebrityOfDay(celeb)"
              >
                Elegir
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firebase.js";

// Importar la función de OpenAI
import { getClues } from "@/services/openaiService.js";

function fixDropboxUrl(originalUrl) {
  if (!originalUrl) return "";
  return originalUrl.replace(
    "https://www.dropbox.com/",
    "https://dl.dropboxusercontent.com/"
  );
}

export default {
  name: "AdminCelebrities",
  setup() {
    const celebrities = ref([]);
    const name = ref("");
    const audioUrl = ref("");
    const isEditing = ref(false);
    let celebIdToEdit = null;

    // Para búsqueda y orden
    const searchTerm = ref("");
    const sortBy = ref("unselectedFirst");

    // Mostramos celebridad de HOY, si existe
    const todayCeleb = ref(null);

    onMounted(async () => {
      await loadCelebs();
      await loadTodayCeleb();
    });

    async function loadCelebs() {
      celebrities.value = [];
      const snapshot = await getDocs(collection(db, "celebrities"));
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        celebrities.value.push({
          id: docSnap.id,
          ...data,
          lastSelectedDate: data.lastSelectedDate || null,
          chosenDate: "",
        });
      });
    }

    async function loadTodayCeleb() {
      const todayStr = getTodayString();
      const dailyColl = collection(db, "dailySelection");
      const q = query(dailyColl, where("date", "==", todayStr));
      const snap = await getDocs(q);
      if (!snap.empty) {
        snap.forEach((docSnap) => {
          todayCeleb.value = docSnap.data();
        });
      } else {
        todayCeleb.value = null;
      }
    }

    function getTodayString() {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    const filteredAndSortedCelebs = computed(() => {
      let results = celebrities.value.filter((celeb) =>
        celeb.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      );

      if (sortBy.value === "unselectedFirst") {
        results.sort((a, b) => {
          if (!a.lastSelectedDate && !b.lastSelectedDate) return 0;
          if (!a.lastSelectedDate) return -1;
          if (!b.lastSelectedDate) return 1;
          return new Date(a.lastSelectedDate) - new Date(b.lastSelectedDate);
        });
      }
      return results;
    });

    /**
     * saveCeleb:
     * - Genera 4 pistas con getClues(name, 'es' / 'en')
     * - Guarda en Firestore { name, audioUrl, clues, ... }
     */
    async function saveCeleb() {
      if (!name.value.trim() || !audioUrl.value.trim()) return;

      const fixedUrl = fixDropboxUrl(audioUrl.value);

      if (!isEditing.value) {
        // Crear nuevo
        await addDoc(collection(db, "celebrities"), {
          name: name.value,
          audioUrl: fixedUrl,
          lastSelectedAt: null,
        });
      } else {
        // Editar existente
        if (!celebIdToEdit) return;
        const docRef = doc(db, "celebrities", celebIdToEdit);
        await updateDoc(docRef, {
          name: name.value,
          audioUrl: fixedUrl,
        });
      }

      // Limpiamos
      name.value = "";
      audioUrl.value = "";
      celebIdToEdit = null;
      isEditing.value = false;

      await loadCelebs();
    }

    function editCeleb(celeb) {
      isEditing.value = true;
      celebIdToEdit = celeb.id;
      name.value = celeb.name;
      audioUrl.value = celeb.audioUrl;
    }

    function cancelEditing() {
      isEditing.value = false;
      celebIdToEdit = null;
      name.value = "";
      audioUrl.value = "";
    }

    async function deleteCeleb(id) {
      if (!confirm("¿Estás seguro de eliminar esta celebridad?")) return;
      await deleteDoc(doc(db, "celebrities", id));
      await loadCelebs();
    }

    async function chooseAsCelebrityOfDay(celeb) {
      if (!celeb.chosenDate) {
        alert("Selecciona una fecha antes de elegir.");
        return;
      }
      // Validar que no sea antes de HOY
      const chosen = new Date(celeb.chosenDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (chosen < today) {
        alert("No puedes elegir la fecha pasada.");
        return;
      }

      // Validar que no exista dailySelection con esa fecha
      const dailyRef = collection(db, "dailySelection");
      const q = query(dailyRef, where("date", "==", celeb.chosenDate));
      const snap = await getDocs(q);
      if (!snap.empty) {
        alert("Ya existe una celebridad elegida para esa fecha.");
        return;
      }

      // 1) Llamar a OpenAI para generar 4 pistas en español y 4 en inglés
      const clues_es = await getClues(celeb.name, "es");
      const clues_en = await getClues(celeb.name, "en");

      // 2) Guardar en dailySelection, incluyendo audioUrl y las 2 versiones de pistas
      await addDoc(dailyRef, {
        celebId: celeb.id,
        name: celeb.name,
        audioUrl: celeb.audioUrl,
        clues_es, // Pistas en español
        clues_en, // Pistas en inglés
        date: celeb.chosenDate, // "YYYY-MM-DD"
        createdAt: serverTimestamp(),
      });

      // 3) Actualizar lastSelectedDate en la coleccion celebrities
      const docRef = doc(db, "celebrities", celeb.id);
      await updateDoc(docRef, {
        lastSelectedDate: celeb.chosenDate,
      });

      alert(`Celebridad "${celeb.name}" elegida para el ${celeb.chosenDate}`);
      await loadCelebs();
    }

    return {
      celebrities,
      name,
      audioUrl,
      isEditing,
      searchTerm,
      sortBy,
      todayCeleb,

      filteredAndSortedCelebs,
      loadCelebs,
      saveCeleb,
      editCeleb,
      cancelEditing,
      deleteCeleb,
      chooseAsCelebrityOfDay,
    };
  },
};
</script>

<style scoped>
/* Ajusta estilos a tu gusto */

/* Transiciones para <transition name="fade"> */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
</style>
