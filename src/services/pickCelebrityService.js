// src/services/pickCelebrityService.js

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";

/**
 * pickCelebrityOfTheDay
 * ---------------------
 * Obtiene todas las celebridades de la colección "celebrities"
 * en Firestore y devuelve 1 celebridad elegida aleatoriamente.
 *
 * @returns {Object} Un objeto con { id, name, imageUrl, audioUrl, .... }
 */
export async function pickCelebrityOfTheDay() {
  // 1. Traer todos los documentos de la colección "celebrities"
  const snapshot = await getDocs(collection(db, "celebrities"));
  const celebArray = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // 2. Elige una celebridad aleatoria de ese array
  if (celebArray.length === 0) {
    throw new Error("No hay celebridades en la colección 'celebrities'.");
  }
  const randomIndex = Math.floor(Math.random() * celebArray.length);
  const chosen = celebArray[randomIndex];

  // 3. Devuelve la celebridad seleccionada
  return chosen;
}
