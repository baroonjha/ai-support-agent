import { Pool } from "pg";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const bootstrapPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.SSL === "true" 
    ? { rejectUnauthorized: false } 
    : false,

});

const runBootstrapMigration = async () => {
    try {
        const dbName = "ai_support_agent";

        const checkRes = await bootstrapPool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbName]
        );

        if (checkRes.rowCount === 0) {
            console.log(`📦 Database "${dbName}" not found. Creating...`);
            await bootstrapPool.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ Database "${dbName}" created.`);
        } else {
            console.log(`✅ Database "${dbName}" already exists.`);
        }

        const appPool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.SSL === "true" 
    ? { rejectUnauthorized: false } 
    : false,
        });

        const schemaPath = path.join(__dirname, "schema.sql");
        const sql = fs.readFileSync(schemaPath, "utf8");

        console.log("⏳ Applying schema...");
        await appPool.query(sql);
        console.log("✅ Schema applied successfully!");

        const res = await appPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
        console.log("📊 Tables in DB:", res.rows.map(r => r.table_name));

        await appPool.end();
    } catch (err) {
        console.error("❌ Bootstrap migration failed:", err);
    } finally {
        await bootstrapPool.end();
    }
};

runBootstrapMigration();
