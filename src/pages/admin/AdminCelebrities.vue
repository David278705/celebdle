<!-- src/pages/admin/AdminCelebrities.vue -->
<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Administrar Celebridades</h1>

    <!-- Tabla de celebridades -->
    <table class="w-full border border-gray-600 text-sm mb-6">
      <thead class="bg-gray-700 text-white">
        <tr>
          <th class="py-2 px-2 text-left">Nombre</th>
          <th class="py-2 px-2 text-left">Audio URL</th>
          <th class="py-2 px-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="celeb in celebrities"
          :key="celeb.id"
          class="border-b border-gray-600"
        >
          <td class="py-2 px-2">{{ celeb.name }}</td>
          <td class="py-2 px-2">{{ celeb.audioUrl }}</td>
          <td class="py-2 px-2 flex items-center justify-center space-x-2">
            <button
              class="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              @click="editCeleb(celeb)"
            >
              Editar
            </button>
            <button
              class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              @click="deleteCeleb(celeb.id)"
            >
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Formulario para añadir / editar -->
    <div class="border border-gray-600 p-4 rounded">
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
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase.js"; // Ajusta la ruta a tu firebase.js

export default {
  name: "AdminCelebrities",
  setup() {
    const celebrities = ref([]);
    const name = ref("");
    const audioUrl = ref("");

    // isEditing indica si estamos en modo "editar" o "crear"
    const isEditing = ref(false);
    // celebIdToEdit guardará el ID del doc que vamos a editar
    let celebIdToEdit = null;

    onMounted(() => {
      loadCelebs();
    });

    async function loadCelebs() {
      celebrities.value = [];
      const snapshot = await getDocs(collection(db, "celebrities"));
      snapshot.forEach((docSnap) => {
        celebrities.value.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });
    }

    async function saveCeleb() {
      if (!name.value.trim() || !audioUrl.value.trim()) return;
      audioUrl.value = fixDropboxUrl(audioUrl.value);
      if (!isEditing.value) {
        // Crear nuevo
        await addDoc(collection(db, "celebrities"), {
          name: name.value,
          audioUrl: audioUrl.value,
        });
      } else {
        // Editar existente
        if (!celebIdToEdit) return;
        const docRef = doc(db, "celebrities", celebIdToEdit);
        await updateDoc(docRef, {
          name: name.value,
          audioUrl: audioUrl.value,
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

    function fixDropboxUrl(originalUrl) {
      if (!originalUrl) return "";
      // Reemplaza https://www.dropbox.com/ por https://dl.dropboxusercontent.com/
      return originalUrl.replace(
        "https://www.dropbox.com/",
        "https://dl.dropboxusercontent.com/"
      );
    }

    async function deleteCeleb(id) {
      if (!confirm("¿Estás seguro de eliminar esta celebridad?")) return;
      await deleteDoc(doc(db, "celebrities", id));
      await loadCelebs();
    }

    return {
      celebrities,
      name,
      audioUrl,
      isEditing,
      loadCelebs,
      saveCeleb,
      editCeleb,
      cancelEditing,
      deleteCeleb,
    };
  },
};
</script>

<style scoped>
/* Ajusta estilos a tu gusto */
</style>
