// src/services/openaiService.js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function generateClues(celebrityName) {
  const prompt = `Genera 4 pistas cortas y creativas sobre la celebridad llamada ${celebrityName}, sin revelar su nombre.`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 100,
  });

  return response.data.choices[0].text.trim();
}
