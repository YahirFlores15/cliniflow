import Database from "better-sqlite3";
import path from "node:path";


const databasePath: string =
    process.env.DATABASE_PATH ??
    path.join(process.cwd(), "db", "cliniflow.sqlite");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
    if (!dbInstance) {
        dbInstance = new Database(databasePath);
        dbInstance.pragma("foreign_keys = ON");
    }

    return dbInstance;
}