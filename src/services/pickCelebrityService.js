// src/services/pickCelebrityService.js
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";

/**
 * Retorna la celebridad del día, o null si no existe registro para hoy.
 * Basado en la nueva estructura de dailySelection:
 * {
 *   date: "YYYY-MM-DD",
 *   name: "...",
 *   profession: "...",
 *   country: "...",
 *   knownFor: "...",
 *   clues_es: [...],
 *   clues_en: [...]
 * }
 */
export async function getCelebrityOfToday() {
  const now = new Date();
  const todayStr = formatDate(now);

  const dailyColl = collection(db, "dailySelection");
  const q = query(dailyColl, where("date", "==", todayStr));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Suponemos que solo existe un documento para la fecha de hoy
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      name: data.name || "",
      profession: data.profession || "",
      country: data.country || "",
      knownFor: data.knownFor || "",
      clues_es: data.clues_es || [],
      clues_en: data.clues_en || [],
    };
  } else {
    // No hay celebridad elegida para hoy
    return null;
  }
}

/**
 * Formatea una fecha Date a "YYYY-MM-DD"
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
