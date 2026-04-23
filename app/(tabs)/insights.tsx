import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { db } from "../../db";
import { categories, habitLogs, habits } from "../../db/schema";

const screenWidth = Dimensions.get("window").width - 64;

export default function InsightsScreen() {
  const { colours } = useTheme();
  const [habitsList, setHabitsList] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const habitsResult = await db.select().from(habits);
    const logsResult = await db.select().from(habitLogs);
    const categoriesResult = await db.select().from(categories);
    setHabitsList(habitsResult);
    setLogsList(logsResult);
    setCategoriesList(categoriesResult);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const label = date.toLocaleDateString("en-IE", { weekday: "short" });
      const count = logsList.filter(
        (l) => l.date === dateStr && l.completed === 1
      ).length;
      days.push({ label, count });
    }
    return days;
  };

  // Calculate current streak — consecutive days where at least one habit was completed
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const completedOnDay = logsList.some(
        (l) => l.date === dateStr && l.completed === 1
      );

      if (completedOnDay) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Calculate streak per habit
  const calculateHabitStreak = (habitId: number) => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const completed = logsList.some(
        (l) => l.habitId === habitId && l.date === dateStr && l.completed === 1
      );

      if (completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const last7Days = getLast7Days();
  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);
  const totalCompletions = logsList.filter((l) => l.completed === 1).length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCompletions = logsList.filter(
    (l) => l.date === todayStr && l.completed === 1
  ).length;
  const currentStreak = calculateStreak();
  const BAR_HEIGHT = 150;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colours.background }]}>
      <Text style={[styles.title, { color: colours.text }]}>Insights</Text>

      {/* Summary Cards */}
      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: colours.card }]}>
          <Ionicons name="checkmark-circle" size={28} color="#2ECC71" />
          <Text style={[styles.cardNumber, { color: colours.text }]}>{todayCompletions}</Text>
          <Text style={[styles.cardLabel, { color: colours.textLight }]}>Today</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colours.card }]}>
          <Ionicons name="calendar" size={28} color="#4A90E2" />
          <Text style={[styles.cardNumber, { color: colours.text }]}>{totalCompletions}</Text>
          <Text style={[styles.cardLabel, { color: colours.textLight }]}>All Time</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colours.card }]}>
          <Ionicons name="list" size={28} color="#9B59B6" />
          <Text style={[styles.cardNumber, { color: colours.text }]}>{habitsList.length}</Text>
          <Text style={[styles.cardLabel, { color: colours.textLight }]}>Habits</Text>
        </View>
      </View>

      {/* Streak Card */}
      <View style={[styles.streakCard, { backgroundColor: currentStreak > 0 ? "#FF6B35" : colours.card }]}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakEmoji}>
            {currentStreak >= 7 ? "🔥" : currentStreak >= 3 ? "⚡" : "💪"}
          </Text>
          <View>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
        <Text style={styles.streakMessage}>
          {currentStreak === 0
            ? "Start your streak today!"
            : currentStreak === 1
            ? "Great start! Keep going!"
            : currentStreak < 7
            ? `${7 - currentStreak} days to a week streak!`
            : currentStreak < 30
            ? "You're on fire! 🔥"
            : "Legendary streak! 🏆"}
        </Text>
      </View>

      {/* Custom Bar Chart */}
      <View style={[styles.chartContainer, { backgroundColor: colours.card }]}>
        <Text style={[styles.sectionTitle, { color: colours.text }]}>Last 7 Days</Text>
        {logsList.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
            <Text style={[styles.emptyText, { color: colours.textLight }]}>No data yet</Text>
          </View>
        ) : (
          <View style={styles.chartWrapper}>
            <View style={[styles.chart, { height: BAR_HEIGHT }]}>
              {last7Days.map((day, index) => {
                const barHeight =
                  day.count > 0
                    ? Math.max((day.count / maxCount) * BAR_HEIGHT, 8)
                    : 4;
                return (
                  <View key={index} style={styles.barColumn}>
                    <Text style={styles.barValue}>
                      {day.count > 0 ? day.count : ""}
                    </Text>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barHeight,
                            backgroundColor: day.count > 0 ? "#4A90E2" : colours.border,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, { color: colours.textLight }]}>
                      {day.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Per Habit Breakdown with streaks */}
      <View style={[styles.section, { backgroundColor: colours.card }]}>
        <Text style={[styles.sectionTitle, { color: colours.text }]}>Habit Breakdown</Text>
        {habitsList.length === 0 ? (
          <Text style={[styles.emptyText, { color: colours.textLight }]}>No habits yet</Text>
        ) : (
          habitsList.map((habit) => {
            const category = categoriesList.find(
              (c) => c.id === habit.categoryId
            );
            const completions = logsList.filter(
              (l) => l.habitId === habit.id && l.completed === 1
            ).length;
            const percentage =
              totalCompletions > 0
                ? Math.round((completions / totalCompletions) * 100)
                : 0;
            const habitStreak = calculateHabitStreak(habit.id);

            return (
              <View
                key={habit.id}
                style={[styles.breakdownItem, { borderBottomColor: colours.border }]}
              >
                <View style={styles.breakdownLeft}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: category?.colour || "#ccc" },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={styles.breakdownNameRow}>
                      <Text style={[styles.breakdownName, { color: colours.text }]}>
                        {habit.name}
                      </Text>
                      {habitStreak > 0 && (
                        <View style={styles.streakBadge}>
                          <Text style={styles.streakBadgeText}>
                            🔥 {habitStreak}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={[styles.miniBarContainer, { backgroundColor: colours.border }]}>
                      <View
                        style={[
                          styles.miniBar,
                          {
                            width: `${percentage}%`,
                            backgroundColor: category?.colour || "#4A90E2",
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
                <Text style={[styles.breakdownCount, { color: colours.primary }]}>
                  {completions}x
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  cardRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },
  cardNumber: { fontSize: 28, fontWeight: "bold", marginTop: 4 },
  cardLabel: { fontSize: 12, marginTop: 2 },
  streakCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streakLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  streakEmoji: { fontSize: 36 },
  streakNumber: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  streakLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  streakMessage: { fontSize: 13, color: "#fff", flex: 1, textAlign: "right", marginLeft: 8 },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  chartWrapper: { alignItems: "center" },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 20,
  },
  barColumn: { alignItems: "center", flex: 1 },
  barValue: { fontSize: 10, color: "#4A90E2", marginBottom: 2, fontWeight: "600" },
  barWrapper: { justifyContent: "flex-end", height: 150 },
  bar: { width: 28, borderRadius: 4 },
  barLabel: { fontSize: 10, marginTop: 4 },
  empty: { alignItems: "center", padding: 24 },
  emptyText: { fontSize: 14, marginTop: 8 },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  breakdownLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  breakdownNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  breakdownName: { fontSize: 14 },
  streakBadge: {
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  streakBadgeText: { fontSize: 11, color: "#fff", fontWeight: "600" },
  miniBarContainer: {
    width: 150,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  miniBar: { height: "100%", borderRadius: 3 },
  breakdownCount: { fontSize: 14, fontWeight: "600" },
});