import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const testConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful:', res.rows[0].now);
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    }
};
