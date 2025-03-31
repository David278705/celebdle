// src/services/openaiService.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * (Opcional) Mantén tu función original getClues si la sigues usando.
 * La dejamos como referencia.
 */
export async function getClues(celebrityName, lang) {
  // ... lógica original ...
}

/**
 * Genera datos sobre la celebridad usando la IA:
 * - profession (en inglés con emoji)
 * - country (en inglés con emoji)
 * - knownFor (en inglés con emoji)
 * - clues_es (4 pistas en español)
 * - clues_en (4 pistas en inglés)
 *
 * Devuelve un objeto JSON con la estructura:
 * {
 *   "profession": "...",
 *   "country": "...",
 *   "knownFor": "...",
 *   "clues_es": [...],
 *   "clues_en": [...]
 * }
 */
export async function generateCelebrityData(celebrityName) {
  const messages = [
    {
      role: "system",
      content: `
      You are a helpful assistant that, given a celebrity name, must:
      1) Infer the profession in English with an appropriate emoji (e.g., "Singer 🎤", "Actor 🎬", "Soccer player ⚽", etc.)
      2) Infer the country in English with an appropriate emoji (e.g., "Colombia 🇨🇴")
      3) Provide something the celebrity is known for in English with an emoji (if singer => a known song 🎶, if actor => a known movie 🎞️, if soccer player => a known team ⚽, etc.)
      4) Provide 4 clues in Spanish (clues_es) in one sentence each, from hardest to easiest, not revealing the name
      5) Provide 4 clues in English (clues_en) in one sentence each, from hardest to easiest, not revealing the name

      Return ONLY valid JSON with the structure:
      {
        "profession": "...",
        "country": "...",
        "knownFor": "...",
        "clues_es": ["...", "...", "...", "..."],
        "clues_en": ["...", "...", "...", "..."]
      }
      No extra keys, no additional text.
      `,
    },
    {
      role: "user",
      content: `Celebrity name: "${celebrityName}". Generate the JSON in English for profession, country, knownFor, and the clues in Spanish (clues_es) and English (clues_en).`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 400,
    temperature: 0.7,
  });

  const rawText = response.choices?.[0]?.message?.content?.trim() || "";

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (err) {
    console.error("No se pudo parsear la respuesta como JSON:", rawText);
    // Retornamos algo vacío en caso de error
    data = {
      profession: "",
      country: "",
      knownFor: "",
      clues_es: [],
      clues_en: [],
    };
  }

  return data;
}
