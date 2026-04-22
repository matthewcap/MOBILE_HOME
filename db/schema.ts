import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull(),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  colour: text("colour").notNull().default("#4A90E2"),
  icon: text("icon"),
});

export const habits = sqliteTable("habits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: text("created_at").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const habitLogs = sqliteTable("habit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  habitId: integer("habit_id").references(() => habits.id),
  date: text("date").notNull(),
  completed: integer("completed").notNull().default(0),
  count: integer("count").default(0),
  notes: text("notes"),
});

export const targets = sqliteTable("targets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  habitId: integer("habit_id").references(() => habits.id),
  categoryId: integer("category_id").references(() => categories.id),
  type: text("type").notNull(),
  goal: integer("goal").notNull(),
  userId: integer("user_id").references(() => users.id),
});