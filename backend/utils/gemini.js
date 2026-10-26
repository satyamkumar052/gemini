import { GoogleGenAI } from "@google/genai";
<<<<<<< HEAD
import dotenv from 'dotenv';
dotenv.config();


const ai = new GoogleGenAI({
    apiKey: process.env.GENAI_API_KEY,
});

const getGeminiResponse = async(message) => {


    try {

        let contents = [];

        if(Array.isArray(message)) {
            contents = message.map((msg) => ({
                role: msg.role ==="user" ? "user" : "model",
                parts: [{ text : msg.content || ""}],
            }));
        } else if(typeof message ==="string") {
            contents = [{ role : "user", parts: [{ text:message }]}];
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents : contents,
        });
        return response.text;

    } catch (err) {
        throw new Error(err.message);
    }

}
=======
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GENAI_API_KEY,
});

const getGeminiResponse = async (message, model = "gemini-2.5-flash", image = null) => {
  try {
    // Image generation handler for gemini-nano-banana-2.1
    if (model === "gemini-nano-banana-2.1") {
      const promptText = Array.isArray(message)
        ? message.filter((m) => m.role === "user").pop()?.content || "A creative image"
        : message;

      let generatedImage = null;
      let text = `Here is your generated image for: "${promptText}"`;

      // 1. Try Gemini's multimodal image model via generateContent
      try {
        const imageRes = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: promptText,
        });

        for (const part of imageRes.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
            generatedImage = {
              data: part.inlineData.data,
              mimeType: part.inlineData.mimeType || "image/png",
            };
          } else if (part.text) {
            text = part.text;
          }
        }
      } catch (imgErr) {
        console.log("Gemini native image gen attempt:", imgErr.message);
      }

      // 2. If enterprise Vertex AI is not enabled for the API key, generate image via FLUX AI
      if (!generatedImage) {
        try {
          const encodedPrompt = encodeURIComponent(promptText);
          const imgResponse = await fetch(`https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&model=flux`);
          if (imgResponse.ok) {
            const arrayBuffer = await imgResponse.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");
            const contentType = imgResponse.headers.get("content-type") || "image/jpeg";
            generatedImage = {
              data: base64Data,
              mimeType: contentType,
            };
          }
        } catch (fallbackErr) {
          console.error("Image generation fallback error:", fallbackErr);
        }
      }

      if (!generatedImage) {
        throw new Error("Failed to generate image. Please try again with a different prompt.");
      }

      return {
        text,
        image: generatedImage,
        totalTokenCount: 150,
      };
    }

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

    let targetModel = model || "gemini-2.5-flash";
    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: contents,
      });
    } catch (modelErr) {
      if (targetModel === "gemini-4-argon" || modelErr.message?.toLowerCase().includes("not found")) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: contents,
          });
        } catch (e2) {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
          });
        }
      } else {
        throw modelErr;
      }
    }
    return {
      text: response.text,
      image: null,
      totalTokenCount: response.usageMetadata?.totalTokenCount || 0,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};
>>>>>>> origin/main

export default getGeminiResponse;
