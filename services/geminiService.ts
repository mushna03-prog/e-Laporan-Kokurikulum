import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ReportData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for the AI response to ensure strict typing
const reportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    activities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of detailed activities carried out during the meeting (3-5 items).",
    },
    values: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of moral values (Nilai Murni) applied (e.g., Kerjasama, Bertanggungjawab).",
    },
    pikebmTitle: {
      type: Type.STRING,
      description: "A suitable title for the PiKeBM (Program Interaktif Kemahiran Bahasa Melayu) insertion.",
    },
    pikebmSummary: {
      type: Type.STRING,
      description: "A brief summary of the PiKeBM activity (5-10 mins language activity).",
    },
    kbat: {
      type: Type.STRING,
      description: "Description of the Higher Order Thinking Skills (KBAT) applied in the session.",
    },
  },
  required: ["activities", "values", "pikebmTitle", "pikebmSummary", "kbat"],
};

export const generateReportContent = async (
  topic: string,
  unitType: string
): Promise<Partial<ReportData>> => {
  if (!topic) return {};

  try {
    const prompt = `
      Anda adalah pembantu guru kokurikulum di Malaysia.
      Sila jana kandungan laporan kokurikulum berdasarkan topik aktiviti: "${topic}" untuk unit: "${unitType}".
      
      Pastikan:
      1. Aktiviti adalah dalam bentuk ayat pasif atau format laporan rasmi.
      2. Masukkan elemen Sisipan PiKeBM (Program Interaktif Kemahiran Bahasa Melayu) yang sesuai.
      3. Nyatakan elemen KBAT (Kemahiran Berfikir Aras Tinggi).
      4. Bahasa Melayu standard dan formal.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No content generated");

    const data = JSON.parse(jsonText);

    return {
      activities: data.activities,
      values: data.values,
      pikebmTitle: data.pikebmTitle,
      pikebmSummary: data.pikebmSummary,
      kbat: data.kbat,
    };
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};
