// src/services/pickCelebrityService.js
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";

// Retorna la celebridad del día (si la hay)
export async function getCelebrityOfToday() {
  const now = new Date();
  const todayStr =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  const dailyColl = collection(db, "dailySelection");
  const q = query(dailyColl, where("date", "==", todayStr));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Suponiendo que solo hay un doc para hoy
    const docSnap = snapshot.docs[0];
    return {
      celebId: docSnap.data().celebId,
      name: docSnap.data().name,
      audioUrl: docSnap.data().audioUrl, // si lo guardaste también
      clues_es: docSnap.data().clues_es,
      clues_en: docSnap.data().clues_en,
    };
  } else {
    // Si no hay celebridad elegida para hoy, podrías devolver null o un error
    return null;
  }
}
