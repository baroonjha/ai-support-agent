import { Router, Request, Response } from "express";
import { query } from "../db";
import { generateReply } from "../utils/llm";

const router = Router();

router.post("/message", async (req: Request, res: Response) => {
    try {
        const { message, sessionId } = req.body;

        // checking empty message
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        // checking message length
        if (message.length > 500) {
            return res.status(400).json({ error: "Message is too long (max 500 chars)" });
        }

        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const result = await query("INSERT INTO conversations DEFAULT VALUES RETURNING id");
            currentSessionId = result.rows[0].id;
        }
        await query(
            'INSERT INTO messages (conversation_id, sender, content) VALUES ($1, $2, $3)',
            [currentSessionId, 'user', message]
        );

        //fetching the last 10 msg for context
        const historyResult = await query(`SELECT sender, content FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 10`, [currentSessionId]);

        const history = historyResult.rows.map((row) => ({
            role: (row.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: row.content
        }));
    
        const aiResponse = await generateReply(message, history);


        await query("INSERT INTO messages (conversation_id, sender, content) VALUES ($1, $2, $3)", [currentSessionId, "ai", aiResponse]);

        return res.json({
            reply: aiResponse,
            sessionId: currentSessionId
        });
    } catch (error) {
        console.error("Error processing chat:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
})

router.get("/history/:sessionId", async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const result = await query("SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC", [sessionId]);
        return res.json(result.rows);
    } catch (error) {
        console.error("Error fetching history:", error);
        return res.status(500).json({ error: "Failed to fetch chat history" });
    }
})


export default router