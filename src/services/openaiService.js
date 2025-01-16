// src/services/openaiService.js
import OpenAI from "openai";

/**
 * Esta librería es para Node >= 18.
 * "dangerouslyAllowBrowser: true" expone la API Key al cliente (no recomendado en producción).
 */
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Genera 4 pistas sobre una celebridad,
 * sin revelar el nombre directamente.
 */
export async function getClues(celebrityName, lang) {
  // Determinar el contenido del mensaje basado en el idioma
  const messages = [
    {
      role: "system",
      content:
        lang === "es"
          ? "Eres un asistente creativo que describe celebridades sin revelar su identidad directamente."
          : "You are a creative assistant who describes celebrities without directly revealing their identity.",
    },
    {
      role: "user",
      content:
        lang === "es"
          ? `
            Genera 4 pistas cortas y creativas sobre la celebridad llamada "${celebrityName}",
            sin revelar su nombre ni mencionar detalles de su profesión o al menos no de forma literal.
            Deben estar ordenadas de la más difícil (pista 1) a la más fácil (pista 4).
            Cada pista debe ser solo una oración. Todas las pistas deben ser difíciles, casi imposibles de adivinar.
          `
          : `
            Generate 4 short and creative clues about the celebrity named "${celebrityName}",
            without revealing their name or mentioning details about their profession or at least not in a literal way.
            They must be ordered from the hardest (clue 1) to the easiest (clue 4).
            Each clue must be just one sentence. All clues should be challenging, almost impossible to guess.
          `,
    }
    
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 150,
    temperature: 0.7,
  });

  // El texto se encuentra en `response.choices[0].message.content`
  const text = response.choices?.[0]?.message?.content?.trim() || "";

  // Convertirlo en un array de 4 pistas,
  const clues = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return clues;
}
