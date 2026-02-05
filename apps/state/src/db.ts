import { Database } from "bun:sqlite";
import { loadConfig } from "../../../shared/config_loader";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const config = loadConfig();

let dbInstance: Database | null = null;

export function getDb(): Database {
    if (dbInstance) return dbInstance;

    const dbPath = config.database.path;
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    dbInstance = new Database(dbPath, { create: true });

    dbInstance.run("PRAGMA journal_mode = WAL;");

    dbInstance.run(`
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            title TEXT,
            status TEXT,
            created_at TEXT,
            updated_at TEXT,
            snapshot_id TEXT,
            root_cause TEXT,
            patch_diff_key TEXT,
            pr_url TEXT,
            validation_status BOOLEAN,
            repo_name TEXT,
            file_path TEXT
        )
    `);

    return dbInstance;
}
