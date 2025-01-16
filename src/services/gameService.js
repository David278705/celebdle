// src/services/gameService.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { pickCelebrityOfTheDay } from "./pickCelebrityService"; // tu lógica de elección
import { getClues } from "@/services/openaiService";

// Ejemplo: definimos la colección donde guardaremos estado del juego
const userGamesCol = collection(db, "userGames");

/**
 * 1. Devuelve (o crea) el estado del juego de un usuario en un día específico.
 *    - userId: string
 *    - dateStr: "YYYY-MM-DD"
 */
export async function getOrCreateDailyGame(userId, dateStr, lang) {
  const docRef = doc(userGamesCol, `${userId}_${dateStr}`);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // Ya hay un juego creado, retornamos su data
    return docSnap.data();
  } else {
    // No existe, así que creamos un nuevo juego
    // 1) Obtenemos la celebrity del día (o la elegimos si no existe)
    const chosenCeleb = await pickCelebrityOfTheDay();
    // 2) Generamos las 4 pistas textuales (solo una vez)
    const clues = await getClues(chosenCeleb.name, lang);

    // Armamos la estructura del nuevo doc
    const newGameState = {
      userId,
      date: dateStr,
      celebrityId: chosenCeleb.id,
      celebrityName: chosenCeleb.name,
      celebrityAudio: chosenCeleb.audioUrl,
      clues, // array con 4 pistas textuales
      currentStep: 1, // inicia en la primera pista
      finished: false,
      // Podrías calcular la hora de reset en medianoche
      resetAt: getResetTimestamp(dateStr),
    };

    await setDoc(docRef, newGameState);
    return newGameState;
  }
}

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
