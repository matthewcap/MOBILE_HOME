import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import * as schema from "./schema";

const sqlite = SQLite.openDatabaseSync("habittracker.db");

export const db = drizzle(sqlite, { schema });

export async function initDB() {
  await sqlite.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      colour TEXT NOT NULL DEFAULT '#4A90E2',
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES categories(id),
      created_at TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER REFERENCES habits(id),
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      count INTEGER DEFAULT 0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER REFERENCES habits(id),
      category_id INTEGER REFERENCES categories(id),
      type TEXT NOT NULL,
      goal INTEGER NOT NULL,
      user_id INTEGER REFERENCES users(id)
    );
  `);
}