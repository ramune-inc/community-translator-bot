import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";

async function runMigrations() {
    console.log("Running migrations...");

    const db = drizzle(process.env.DATABASE_URL!);

    // pgvector 拡張機能を有効化
    console.log("Enabling pgvector extension...");
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);

    // マイグレーション実行
    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("Migrations completed successfully!");
    process.exit(0);
}

runMigrations().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
