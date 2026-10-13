import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GENAI_API_KEY,
});

const getGeminiResponse = async (message, model = "gemini-2.5-flash", image = null) => {
  try {
    let contents = [];

    if (Array.isArray(message)) {
      contents = message.map((msg, index) => {
        let parts = [];

        if (msg.content) {
          parts.push({ text: msg.content });
        }

        if (msg.image && msg.image.data) {
          parts.push({
            inlineData: {
              data: msg.image.data,
              mimeType: msg.image.mimeType || "image/png",
            },
          });
        } else if (index === message.length - 1 && image && image.data) {
          parts.push({
            inlineData: {
              data: image.data,
              mimeType: image.mimeType || "image/png",
            },
          });
        }

        if (parts.length === 0) {
          parts.push({ text: "" });
        }

        return {
          role: msg.role === "user" ? "user" : "model",
          parts: parts,
        };
      });
    } else if (typeof message === "string") {
      let parts = [{ text: message }];
      if (image && image.data) {
        parts.push({
          inlineData: {
            data: image.data,
            mimeType: image.mimeType || "image/png",
          },
        });
      }
      contents = [{ role: "user", parts }];
    }

    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: contents,
    });

    return {
      text: response.text,
      totalTokenCount: response.usageMetadata?.totalTokenCount || 0,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

export default getGeminiResponse;
