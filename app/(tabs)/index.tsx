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
import { useTheme } from "../../context/ThemeContext";
import { db } from "../../db";
import { categories, habitLogs, habits, users } from "../../db/schema";

declare global {
  var userId: number | undefined;
}

export default function HabitsScreen() {
  const router = useRouter();
  const { colours, theme, toggleTheme } = useTheme();
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
  const handleDeleteProfile = () => {
  Alert.alert(
    "Delete Profile",
    "Are you sure you want to permanently delete your account? This cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await db.delete(users).where(eq(users.id, global.userId!));
            global.userId = undefined;
            router.replace("/auth/login");
          } catch (e) {
            Alert.alert("Error", "Could not delete profile. Please try again.");
          }
        },
      },
    ]
  );
};

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
    <View style={[styles.container, { backgroundColor: colours.background }]}>
      <View style={styles.header}>
  <Text style={[styles.title, { color: colours.text }]}>My Habits</Text>
  <View style={{ flexDirection: "row", gap: 16 }}>
    <TouchableOpacity onPress={toggleTheme}>
      <Ionicons
        name={theme === "light" ? "moon-outline" : "sunny-outline"}
        size={24}
        color={colours.text}
      />
    </TouchableOpacity>
    <TouchableOpacity onPress={handleDeleteProfile}>
      <Ionicons name="person-remove-outline" size={24} color={colours.warning} />
    </TouchableOpacity>
    <TouchableOpacity onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={26} color={colours.danger} />
    </TouchableOpacity>
  </View>
</View>

      <Text style={[styles.dateText, { color: colours.textLight }]}>
        {new Date().toLocaleDateString("en-IE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </Text>

      {/* Progress Summary */}
      <View style={[styles.progressCard, { backgroundColor: colours.card }]}>
        <Text style={[styles.progressText, { color: colours.text }]}>
          {completedCount} of {habitsList.length} completed today
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colours.border }]}>
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
      <View style={[styles.searchBar, { backgroundColor: colours.card }]}>
        <Ionicons name="search-outline" size={18} color={colours.textLight} />
        <TextInput
          style={[styles.searchInput, { color: colours.text }]}
          placeholder="Search habits..."
          placeholderTextColor={colours.textLight}
          value={searchText}
          onChangeText={setSearchText}
          accessibilityLabel="Search habits"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={18} color={colours.textLight} />
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
            { backgroundColor: colours.card, borderColor: colours.border },
            filterCategory === null && styles.filterChipActive,
          ]}
          onPress={() => setFilterCategory(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: colours.text },
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
              { backgroundColor: colours.card, borderColor: colours.border },
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
                { color: colours.text },
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
          <Ionicons name="checkmark-circle-outline" size={48} color={colours.textLight} />
          <Text style={[styles.emptyText, { color: colours.textLight }]}>
            {searchText || filterCategory ? "No habits match your search" : "No habits yet"}
          </Text>
          <Text style={[styles.emptySubtext, { color: colours.textLight }]}>
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
              <View style={[
                styles.habitItem,
                { backgroundColor: colours.card },
                completed && styles.habitCompleted,
              ]}>
                <TouchableOpacity
                  onPress={() => toggleComplete(item.id)}
                  style={styles.checkbox}
                >
                  <Ionicons
                    name={completed ? "checkmark-circle" : "ellipse-outline"}
                    size={28}
                    color={completed ? "#2ECC71" : colours.textLight}
                  />
                </TouchableOpacity>
                <View style={styles.habitInfo}>
                  <Text style={[
                    styles.habitName,
                    { color: colours.text },
                    completed && styles.habitNameDone,
                  ]}>
                    {item.name}
                  </Text>
                  {category && (
                    <View style={styles.categoryBadge}>
                      <View
                        style={[styles.categoryDot, { backgroundColor: category.colour }]}
                      />
                      <Text style={[styles.categoryText, { color: colours.textLight }]}>
                        {category.name}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Ionicons name="pencil-outline" size={20} color={colours.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={{ marginLeft: 12 }}
                  >
                    <Ionicons name="trash-outline" size={20} color={colours.danger} />
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
          <View style={[styles.modalContent, { backgroundColor: colours.card }]}>
            <Text style={[styles.modalTitle, { color: colours.text }]}>
              {editingHabit ? "Edit Habit" : "New Habit"}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: colours.border, color: colours.text }]}
              placeholder="Habit name"
              placeholderTextColor={colours.textLight}
              value={name}
              onChangeText={setName}
              accessibilityLabel="Habit name input"
            />
            <TextInput
              style={[styles.input, { borderColor: colours.border, color: colours.text }]}
              placeholder="Description (optional)"
              placeholderTextColor={colours.textLight}
              value={description}
              onChangeText={setDescription}
              accessibilityLabel="Habit description input"
            />
            <Text style={[styles.label, { color: colours.text }]}>Category</Text>
            <View style={styles.categoryRow}>
              {categoriesList.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    { borderColor: colours.border },
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
                  <Text style={[styles.categoryOptionText, { color: colours.text }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colours.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelText, { color: colours.text }]}>Cancel</Text>
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
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  dateText: { fontSize: 14, marginBottom: 12 },
  progressCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  progressText: { fontSize: 14, marginBottom: 8 },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#2ECC71", borderRadius: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    elevation: 2,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterRow: { marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: "#4A90E2", borderColor: "#4A90E2" },
  filterChipText: { fontSize: 13 },
  filterChipTextActive: { color: "#fff", fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 18, marginTop: 12, textAlign: "center" },
  emptySubtext: { fontSize: 14, marginTop: 4, textAlign: "center" },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  habitCompleted: { opacity: 0.7 },
  checkbox: { marginRight: 12 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: "500" },
  habitNameDone: { textDecorationLine: "line-through" },
  categoryBadge: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  categoryText: { fontSize: 12 },
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    margin: 4,
  },
  categoryOptionText: { fontSize: 13, marginLeft: 4 },
  modalButtons: { flexDirection: "row", gap: 12 },
  button: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
  saveButton: { backgroundColor: "#4A90E2" },
  cancelText: { fontWeight: "600" },
  saveText: { color: "#fff", fontWeight: "600" },
});