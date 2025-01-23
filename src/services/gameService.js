// src/services/gameService.js
import { collection, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

// Ejemplo: definimos la colección donde guardaremos estado del juego
const userGamesCol = collection(db, "userGames");

/**
 * Actualiza el estado del juego (currentStep, finished, etc.)
 * - partialData es un objeto con las props a actualizar, p.ej. { currentStep: 3 }
 */
export async function updateDailyGame(userId, dateStr, partialData) {
  const docRef = doc(userGamesCol, `${userId}_${dateStr}`);
  await updateDoc(docRef, partialData);
}

/**
 * Ejemplo rápido: calcular el timestamp de la próxima medianoche (opcional).
 * Esto te serviría para saber cuánto falta para el siguiente día y mostrar un countdown.
 */
function getResetTimestamp(dateStr) {
  // dateStr: "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day + 1);
  // medianoche del día siguiente
  return date.getTime(); // milisegundos
}
