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
export async function getClues(celebrityName) {
  // Usaremos el endpoint de chat
  // "gpt-4o-mini" es un modelo "chat" (similar a "gpt-4", "gpt-3.5-turbo", etc.)
  const messages = [
    {
      role: "system",
      content:
        "Eres un asistente creativo que describe celebridades sin revelar su identidad directamente.",
    },
    {
      role: "user",
      content: `
      Genera 4 pistas cortas y creativas sobre la celebridad llamada "${celebrityName}",
      sin revelar su nombre. 
      Deben estar ordenadas de la más difícil (pista 1) a la más fácil (pista 4).
      Cada pista debe ser solo una oración.
      `,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Asumiendo que existe ese modelo en tu cuenta
    messages,
    max_tokens: 150,
    temperature: 0.7,
  });

  // El texto se encuentra en `response.choices[0].message.content`
  const text = response.choices?.[0]?.message?.content?.trim() || "";

  // Convertirlo en un array de 4 pistas,
  // asumiendo que cada pista está en una línea distinta:
  const clues = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return clues;
}
