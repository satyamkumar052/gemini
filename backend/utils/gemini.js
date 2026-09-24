import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();


const ai = new GoogleGenAI({
    apiKey: process.env.GENAI_API_KEY,
});

const getGeminiResponse = async(message) => {


    try {

        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [
            {
            role: "user",
            parts: [{ 
                    text: message
                }],
            },
        ],
        });

        return response.candidates[0].content.parts[0].text;

    } catch (err) {
        throw new Error(err.message);
    }

}

export default getGeminiResponse;
