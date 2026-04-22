import { count } from "drizzle-orm";
import { db } from "./index";
import { categories, habitLogs, habits, targets, users } from "./schema";

export async function seedDatabase() {
  // Only seed if the database is empty
  const existing = await db.select({ count: count() }).from(habits);
  if (existing[0].count > 0) return;

  // Categories
  const insertedCategories = await db.insert(categories).values([
    { name: "Health", colour: "#E74C3C", icon: "heart" },
    { name: "Fitness", colour: "#2ECC71", icon: "barbell" },
    { name: "Mindfulness", colour: "#9B59B6", icon: "leaf" },
    { name: "Learning", colour: "#F39C12", icon: "book" },
  ]).returning();

  // Demo user
  const insertedUsers = await db.insert(users).values([
    { username: "demo", password: "demo123", createdAt: new Date().toISOString() },
  ]).returning();

  const userId = insertedUsers[0].id;

  // Habits
  const insertedHabits = await db.insert(habits).values([
    { name: "Drink 2L Water", description: "Stay hydrated daily", categoryId: insertedCategories[0].id, createdAt: new Date().toISOString(), userId },
    { name: "Morning Run", description: "30 minute run", categoryId: insertedCategories[1].id, createdAt: new Date().toISOString(), userId },
    { name: "Meditate", description: "10 minutes of mindfulness", categoryId: insertedCategories[2].id, createdAt: new Date().toISOString(), userId },
    { name: "Read", description: "Read for 20 minutes", categoryId: insertedCategories[3].id, createdAt: new Date().toISOString(), userId },
  ]).returning();

  // Habit logs for the past 14 days
  const today = new Date();
  const logs = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    for (const habit of insertedHabits) {
      logs.push({
        habitId: habit.id,
        date: dateStr,
        completed: Math.random() > 0.3 ? 1 : 0,
        count: Math.floor(Math.random() * 3) + 1,
      });
    }
  }
  await db.insert(habitLogs).values(logs);

  // Targets
  await db.insert(targets).values([
    { habitId: insertedHabits[0].id, type: "weekly", goal: 7, userId },
    { habitId: insertedHabits[1].id, type: "weekly", goal: 5, userId },
    { habitId: insertedHabits[2].id, type: "monthly", goal: 20, userId },
    { habitId: insertedHabits[3].id, type: "monthly", goal: 25, userId },
  ]);
}