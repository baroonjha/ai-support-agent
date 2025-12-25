import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import chatRoutes from './routes/chat';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('AI Support Agent Backend is Running!');
});
app.use("/chat",chatRoutes)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
