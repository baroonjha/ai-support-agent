import { OpenAI } from "openai";
import * as dotenv from "dotenv";
dotenv.config();

const openai= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage= {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const generateReply = async (message: string, history: ChatMessage[]): Promise<string> => {
    try {
        const systemPrompt = `You are a helpful customer support agent for solving customer queries.
        Here is our knowledge base;
        - Shipping: Free for orders over ₹499. Below ₹499 shipping is ₹49.
      - Returns: 5-day return policy. Customer pays return shipping.
      - Hours: Mon-Fri, 9am-7pm IST.
      
      Be concise. If you don't know the answer, say "Our support agent will get you in touch with you as soon as possible."
        `
        const messageForLLM = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: message }
        ]

        const response= await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messageForLLM as any,
            max_tokens: 150,
        });

        return response.choices[0].message.content || "I'm sorry, I didn't catch that."
    } catch (error) {
        console.error("OpenAi error generating reply:", error);
        return "I am currently experiencing high traffic.I'm sorry,I'm having trouble processing your message."
    }

}

