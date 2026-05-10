import { GoogleGenAI, Type } from "@google/genai";
import { CurriculumPhase } from "./curriculum";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseCurriculumFromImage(base64Image: string, mimeType: string): Promise<CurriculumPhase[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: `Extract the curriculum phases and their respective sessions from the uploaded image.  
          Return a JSON array of curriculum phases. Each element should have:
          - 'id': A unique short ID like 'p1.1' 
          - 'name': The name of the phase
          - 'sessions': An array of session objects, each containing an 'id' and 'title'.
          The output must match this schema exactly.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING }
                },
                required: ["id", "title"]
              }
            }
          },
          required: ["id", "name", "sessions"]
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to extract curriculum data");
  }

  const parsed = JSON.parse(response.text.trim());
  return parsed as CurriculumPhase[];
}
