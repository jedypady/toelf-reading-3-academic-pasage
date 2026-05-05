
import { GoogleGenAI, Type } from "@google/genai";
import { PassageContent } from '../types';

const getGeminiService = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const passageSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, academic title for the passage.",
    },
    passage: {
      type: Type.STRING,
      description: "The full text of the academic passage (180-220 words).",
    },
    questions: {
      type: Type.ARRAY,
      description: "An array of exactly five question objects.",
      items: {
        type: Type.OBJECT,
        properties: {
          questionType: {
            type: Type.STRING,
            description: "The specific type of question (e.g., 'Vocabulary in Context').",
          },
          questionText: {
            type: Type.STRING,
            description: "The full text of the question.",
          },
          options: {
            type: Type.OBJECT,
            properties: {
              A: { type: Type.STRING },
              B: { type: Type.STRING },
              C: { type: Type.STRING },
              D: { type: Type.STRING },
            },
            required: ["A", "B", "C", "D"],
          },
          correctAnswer: {
            type: Type.STRING,
            description: "A single character: 'A', 'B', 'C', or 'D'.",
          },
          explanation: {
            type: Type.STRING,
            description: "A brief explanation of why the correct answer is correct.",
          },
        },
        required: ["questionType", "questionText", "options", "correctAnswer", "explanation"],
      },
    },
  },
  required: ["title", "passage", "questions"],
};

export const generatePassageAndQuestions = async (): Promise<PassageContent> => {
  const ai = getGeminiService();
  const prompt = `
    You are an expert in creating educational content for TOEFL preparation. Your task is to generate a complete, self-contained academic reading practice set.

    Follow these instructions precisely:
    1.  **Generate an Academic Passage:** Write an original, expository passage of approximately 180-220 words. The language must be neutral, academic English, suitable for a university-level text. The topic must be non-technical and from one of these fields: History, Art and Music, Business and Economics, Life Science, Physical Science, or Social Science.
    2.  **Generate Five Questions:** Based on the passage, create five unique multiple-choice questions. Each question must test a different comprehension skill. You must choose five distinct types from this list: Factual Information, Negative Factual Information, Vocabulary in Context, Rhetorical Purpose, Inference, Paragraph Relationship, Important Idea.
    3.  **Format the Output:** You MUST return your entire response as a single, valid JSON object that conforms to the provided schema. Do not include any text, markdown, or explanations outside of the JSON structure.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: passageSchema,
      temperature: 1,
    }
  });

  const jsonText = response.text.trim();
  try {
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as PassageContent;
  } catch (error) {
    console.error("Failed to parse Gemini response:", jsonText);
    throw new Error("Received invalid JSON from the API.");
  }
};
