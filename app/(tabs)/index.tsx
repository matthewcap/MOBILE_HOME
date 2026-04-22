import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../db";
import { categories, habitLogs, habits } from "../../db/schema";

export default function HabitsScreen() {
  const router = useRouter();
  const [habitsList, setHabitsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const habitsResult = await db.select().from(habits);
    const categoriesResult = await db.select().from(categories);
    const logsResult = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.date, today));
    setHabitsList(habitsResult);
    setCategoriesList(categoriesResult);
    setTodayLogs(logsResult);
  };

  const getCategoryForHabit = (categoryId: number) => {
    return categoriesList.find((c) => c.id === categoryId);
  };

  const isCompletedToday = (habitId: number) => {
    return todayLogs.some((l) => l.habitId === habitId && l.completed === 1);
  };

  const toggleComplete = async (habitId: number) => {
    const existing = todayLogs.find((l) => l.habitId === habitId);
    if (existing) {
      await db
        .update(habitLogs)
        .set({ completed: existing.completed === 1 ? 0 : 1 })
        .where(eq(habitLogs.id, existing.id));
    } else {
      await db.insert(habitLogs).values({
        habitId,
        date: today,
        completed: 1,
        count: 1,
      });
    }
    loadData();
  };

  const openAddModal = () => {
    setEditingHabit(null);
    setName("");
    setDescription("");
    setSelectedCategory(categoriesList[0]?.id || null);
    setModalVisible(true);
  };

  const openEditModal = (habit: any) => {
    setEditingHabit(habit);
    setName(habit.name);
    setDescription(habit.description || "");
    setSelectedCategory(habit.categoryId);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (editingHabit) {
      await db
        .update(habits)
        .set({ name, description, categoryId: selectedCategory })
        .where(eq(habits.id, editingHabit.id));
    } else {
      await db.insert(habits).values({
        name,
        description,
        categoryId: selectedCategory,
        createdAt: new Date().toISOString(),
        userId: global.userId,
      });
    }
    setModalVisible(false);
    loadData();
  };

  const handleDelete = (habit: any) => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.delete(habits).where(eq(habits.id, habit.id));
            loadData();
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          global.userId = undefined;
          router.replace("/auth/login");
        },
      },
    ]);
  };

  // Filter habits by search text and category
  const filteredHabits = habitsList.filter((habit) => {
    const matchesSearch = habit.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      filterCategory === null || habit.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const completedCount = todayLogs.filter((l) => l.completed === 1).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={26} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      <Text style={styles.dateText}>
        {new Date().toLocaleDateString("en-IE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </Text>

      {/* Progress Summary */}
      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          {completedCount} of {habitsList.length} completed today
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: habitsList.length > 0
                  ? `${(completedCount / habitsList.length) * 100}%`
                  : "0%",
              } as any,
            ]}
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search habits..."
          value={searchText}
          onChangeText={setSearchText}
          accessibilityLabel="Search habits"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterCategory === null && styles.filterChipActive,
          ]}
          onPress={() => setFilterCategory(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              filterCategory === null && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categoriesList.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.filterChip,
              filterCategory === cat.id && {
                backgroundColor: cat.colour,
                borderColor: cat.colour,
              },
            ]}
            onPress={() =>
              setFilterCategory(filterCategory === cat.id ? null : cat.id)
            }
          >
            <Text
              style={[
                styles.filterChipText,
                filterCategory === cat.id && styles.filterChipTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchText || filterCategory ? "No habits match your search" : "No habits yet"}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchText || filterCategory ? "Try a different filter" : "Tap + to add your first habit"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHabits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const category = getCategoryForHabit(item.categoryId);
            const completed = isCompletedToday(item.id);
            return (
              <View style={[styles.habitItem, completed && styles.habitCompleted]}>
                <TouchableOpacity
                  onPress={() => toggleComplete(item.id)}
                  style={styles.checkbox}
                >
                  <Ionicons
                    name={completed ? "checkmark-circle" : "ellipse-outline"}
                    size={28}
                    color={completed ? "#2ECC71" : "#ccc"}
                  />
                </TouchableOpacity>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, completed && styles.habitNameDone]}>
                    {item.name}
                  </Text>
                  {category && (
                    <View style={styles.categoryBadge}>
                      <View
                        style={[styles.categoryDot, { backgroundColor: category.colour }]}
                      />
                      <Text style={styles.categoryText}>{category.name}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Ionicons name="pencil-outline" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={{ marginLeft: 12 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingHabit ? "Edit Habit" : "New Habit"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Habit name"
              value={name}
              onChangeText={setName}
              accessibilityLabel="Habit name input"
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              accessibilityLabel="Habit description input"
            />
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {categoriesList.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory === cat.id && {
                      borderColor: cat.colour,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <View
                    style={[styles.categoryDot, { backgroundColor: cat.colour }]}
                  />
                  <Text style={styles.categoryOptionText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  dateText: { fontSize: 14, color: "#999", marginBottom: 12 },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  progressText: { fontSize: 14, color: "#555", marginBottom: 8 },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#2ECC71", borderRadius: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    elevation: 2,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#333" },
  filterRow: { marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: "#4A90E2", borderColor: "#4A90E2" },
  filterChipText: { fontSize: 13, color: "#555" },
  filterChipTextActive: { color: "#fff", fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 18, color: "#999", marginTop: 12, textAlign: "center" },
  emptySubtext: { fontSize: 14, color: "#ccc", marginTop: 4, textAlign: "center" },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  habitCompleted: { opacity: 0.7 },
  checkbox: { marginRight: 12 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, color: "#333", fontWeight: "500" },
  habitNameDone: { textDecorationLine: "line-through", color: "#999" },
  categoryBadge: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  categoryText: { fontSize: 12, color: "#999" },
  actions: { flexDirection: "row" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#4A90E2",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#555", marginBottom: 8 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 4,
  },
  categoryOptionText: { fontSize: 13, color: "#333", marginLeft: 4 },
  modalButtons: { flexDirection: "row", gap: 12 },
  button: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
  cancelButton: { backgroundColor: "#f0f0f0" },
  saveButton: { backgroundColor: "#4A90E2" },
  cancelText: { color: "#555", fontWeight: "600" },
  saveText: { color: "#fff", fontWeight: "600" },
});