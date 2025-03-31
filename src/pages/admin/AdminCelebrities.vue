<template>
  <div class="admin-celebrities">
    <!-- Título principal -->
    <h1>Administrar Celebridades</h1>

    <!-- Overlay de carga (spinner) -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <!-- Formulario para crear la celebridad del día -->
    <form @submit.prevent="onSubmit" class="form-celebrities">
      <div class="form-group">
        <label for="celebrityName">
          Nombres de la celebridad (máx. 10, separados por coma):
        </label>
        <input
          type="text"
          id="celebrityName"
          v-model="celebrityName"
          placeholder="Ej: Shakira, Tom Hanks, Lionel Messi..."
          required
        />
      </div>

      <button type="submit" :disabled="isLoading">
        Crear Celebridades del Día (IA)
      </button>
    </form>

    <hr />

    <!-- Listado de dailySelection (fechas programadas) -->
    <h2>Fechas Programadas</h2>
    <ul class="scheduled-list">
      <li v-for="item in scheduledCelebs" :key="item.id">
        <strong>{{ item.date }}:</strong> {{ item.name }} ({{
          item.profession
        }})
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  where,
  query,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { generateCelebrityData } from "@/services/openaiService";

const celebrityName = ref("");
const scheduledCelebs = ref([]);
const isLoading = ref(false);

/**
 * Cargar la lista de dailySelection al montar
 */
onMounted(() => {
  fetchScheduledCelebs();
});

/**
 * Maneja el formulario:
 * - Permite hasta 10 nombres, separados por comas.
 * - Para cada nombre, genera la data con la IA, busca la fecha libre y
 *   crea un doc en dailySelection.
 * - Además, crea un doc en "celebrities" con el "name" nada más.
 */
async function onSubmit() {
  if (!celebrityName.value.trim()) {
    alert("Debe ingresar al menos un nombre de celebridad.");
    return;
  }

  try {
    isLoading.value = true;

    // 1) Dividir el input por comas, limpiar espacios, tomar hasta 10
    const names = celebrityName.value
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .slice(0, 10);

    if (!names.length) {
      alert("No se detectaron nombres válidos.");
      return;
    }

    let createdCount = 0;

    for (const name of names) {
      // a) Crear doc en "celebrities" con solo { name }

      const celebCol = collection(db, "celebrities");

      const q = query(celebCol, where("name", "==", name));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        // Si entra aquí, ya existe un documento con ese name
        console.warn(`La celebridad "${name}" ya existe. Se omite.`);
        continue; // saltamos esta celebridad
      }

      await addDoc(celebCol, { name });

      // b) Pedir datos a la IA (profesión, país, etc.)
      const data = await generateCelebrityData(name);

      // c) Calcular la fecha libre
      const freeDateStr = await getNextAvailableDate();

      // d) Crear doc en dailySelection para esa fecha
      const docRef = doc(db, "dailySelection", freeDateStr);
      await setDoc(docRef, {
        date: freeDateStr,
        name,
        profession: data.profession || "",
        country: data.country || "",
        knownFor: data.knownFor || "",
        clues_es: data.clues_es || [],
        clues_en: data.clues_en || [],
      });

      createdCount++;
    }

    alert(`Se crearon ${createdCount} celebridades del día correctamente.`);
    celebrityName.value = "";
    await fetchScheduledCelebs();
  } catch (error) {
    console.error("Error al crear celebridades:", error);
    alert("Ocurrió un error. Revisa la consola.");
  } finally {
    isLoading.value = false;
  }
}

/**
 * Lee dailySelection para mostrar las fechas programadas
 */
async function fetchScheduledCelebs() {
  try {
    const dailyColl = collection(db, "dailySelection");
    const snapshot = await getDocs(dailyColl);
    scheduledCelebs.value = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Error obteniendo dailySelection:", error);
  }
}

/**
 * Retorna la primera fecha libre a partir de hoy.
 */
async function getNextAvailableDate() {
  let currentDate = new Date();
  while (true) {
    const dateStr = formatDate(currentDate);
    const docRef = doc(db, "dailySelection", dateStr);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return dateStr;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
</script>

<style scoped>
.admin-celebrities {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.admin-celebrities h1 {
  text-align: center;
  margin-bottom: 1rem;
}

/* Formulario */
.form-celebrities {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-group input {
  padding: 0.5rem;
  font-size: 1rem;
}

/* Listado */
.scheduled-list {
  margin-top: 1rem;
  list-style: none;
  padding: 0;
}
.scheduled-list li {
  margin-bottom: 0.5rem;
}

/* Overlay de carga */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* Spinner */
.spinner {
  width: 50px;
  height: 50px;
  border: 6px solid #cccccc;
  border-top-color: #3c85f7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
