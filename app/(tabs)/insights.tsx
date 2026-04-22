import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { db } from "../../db";
import { categories, habitLogs, habits } from "../../db/schema";

const screenWidth = Dimensions.get("window").width - 64;

export default function InsightsScreen() {
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

  const last7Days = getLast7Days();
  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);
  const totalCompletions = logsList.filter((l) => l.completed === 1).length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCompletions = logsList.filter(
    (l) => l.date === todayStr && l.completed === 1
  ).length;

  const BAR_HEIGHT = 150;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Insights</Text>

      {/* Summary Cards */}
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Ionicons name="checkmark-circle" size={28} color="#2ECC71" />
          <Text style={styles.cardNumber}>{todayCompletions}</Text>
          <Text style={styles.cardLabel}>Today</Text>
        </View>
        <View style={styles.card}>
          <Ionicons name="calendar" size={28} color="#4A90E2" />
          <Text style={styles.cardNumber}>{totalCompletions}</Text>
          <Text style={styles.cardLabel}>All Time</Text>
        </View>
        <View style={styles.card}>
          <Ionicons name="list" size={28} color="#9B59B6" />
          <Text style={styles.cardNumber}>{habitsList.length}</Text>
          <Text style={styles.cardLabel}>Habits</Text>
        </View>
      </View>

      {/* Custom Bar Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Last 7 Days</Text>
        {logsList.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No data yet</Text>
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
                            backgroundColor:
                              day.count > 0 ? "#4A90E2" : "#e0e0e0",
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{day.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Per Habit Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habit Breakdown</Text>
        {habitsList.length === 0 ? (
          <Text style={styles.emptyText}>No habits yet</Text>
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
            return (
              <View key={habit.id} style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: category?.colour || "#ccc" },
                    ]}
                  />
                  <View>
                    <Text style={styles.breakdownName}>{habit.name}</Text>
                    <View style={styles.miniBarContainer}>
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
                <Text style={styles.breakdownCount}>{completions}x</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 16 },
  cardRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },
  cardNumber: { fontSize: 28, fontWeight: "bold", color: "#333", marginTop: 4 },
  cardLabel: { fontSize: 12, color: "#999", marginTop: 2 },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 12 },
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
  barLabel: { fontSize: 10, color: "#999", marginTop: 4 },
  empty: { alignItems: "center", padding: 24 },
  emptyText: { fontSize: 14, color: "#ccc", marginTop: 8 },
  section: {
    backgroundColor: "#fff",
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
    borderBottomColor: "#f0f0f0",
  },
  breakdownLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  breakdownName: { fontSize: 14, color: "#333", marginBottom: 4 },
  miniBarContainer: {
    width: 150,
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  miniBar: { height: "100%", borderRadius: 3 },
  breakdownCount: { fontSize: 14, color: "#4A90E2", fontWeight: "600" },
});