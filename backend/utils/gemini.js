import { GoogleGenAI } from "@google/genai";
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

export default getGeminiResponse;
