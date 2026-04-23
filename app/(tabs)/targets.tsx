import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { db } from "../../db";
import { categories, habits, targets } from "../../db/schema";

export default function TargetsScreen() {
  const { colours } = useTheme();
  const [targetsList, setTargetsList] = useState<any[]>([]);
  const [habitsList, setHabitsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTarget, setEditingTarget] = useState<any>(null);
  const [selectedHabit, setSelectedHabit] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<"weekly" | "monthly">("weekly");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const targetsResult = await db.select().from(targets);
    const habitsResult = await db.select().from(habits);
    const categoriesResult = await db.select().from(categories);
    setTargetsList(targetsResult);
    setHabitsList(habitsResult);
    setCategoriesList(categoriesResult);
  };

  const getHabitName = (habitId: number) => {
    return habitsList.find((h) => h.id === habitId)?.name || "Unknown";
  };

  const getCategoryForHabit = (habitId: number) => {
    const habit = habitsList.find((h) => h.id === habitId);
    return categoriesList.find((c) => c.id === habit?.categoryId);
  };

  const openAddModal = () => {
    setEditingTarget(null);
    setSelectedHabit(habitsList[0]?.id || null);
    setSelectedType("weekly");
    setGoal("");
    setModalVisible(true);
  };

  const openEditModal = (target: any) => {
    setEditingTarget(target);
    setSelectedHabit(target.habitId);
    setSelectedType(target.type);
    setGoal(target.goal.toString());
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!goal || isNaN(Number(goal)) || Number(goal) <= 0) {
      Alert.alert("Error", "Please enter a valid goal number");
      return;
    }
    if (!selectedHabit) {
      Alert.alert("Error", "Please select a habit");
      return;
    }
    if (editingTarget) {
      await db
        .update(targets)
        .set({ habitId: selectedHabit, type: selectedType, goal: Number(goal) })
        .where(eq(targets.id, editingTarget.id));
    } else {
      await db.insert(targets).values({
        habitId: selectedHabit,
        type: selectedType,
        goal: Number(goal),
        userId: global.userId,
      });
    }
    setModalVisible(false);
    loadData();
  };

  const handleDelete = (target: any) => {
    Alert.alert("Delete Target", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.delete(targets).where(eq(targets.id, target.id));
          loadData();
        },
      },
    ]);
  };

  const getProgress = (target: any) => {
    return Math.floor(Math.random() * target.goal);
  };

  return (
    <View style={[styles.container, { backgroundColor: colours.background }]}>
      <Text style={[styles.title, { color: colours.text }]}>Targets</Text>

      {targetsList.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={48} color={colours.textLight} />
          <Text style={[styles.emptyText, { color: colours.textLight }]}>No targets yet</Text>
          <Text style={[styles.emptySubtext, { color: colours.textLight }]}>Set a goal to stay on track</Text>
        </View>
      ) : (
        <FlatList
          data={targetsList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const progress = getProgress(item);
            const percentage = Math.min((progress / item.goal) * 100, 100);
            const exceeded = progress >= item.goal;
            const category = getCategoryForHabit(item.habitId);

            return (
              <View style={[styles.targetItem, { backgroundColor: colours.card }]}>
                <View style={styles.targetHeader}>
                  <View style={styles.targetInfo}>
                    <Text style={[styles.habitName, { color: colours.text }]}>
                      {getHabitName(item.habitId)}
                    </Text>
                    <View style={styles.badges}>
                      <View style={[styles.badge, { backgroundColor: exceeded ? "#2ECC71" : colours.primary }]}>
                        <Text style={styles.badgeText}>{item.type}</Text>
                      </View>
                      {category && (
                        <View style={[styles.badge, { backgroundColor: category.colour }]}>
                          <Text style={styles.badgeText}>{category.name}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openEditModal(item)}>
                      <Ionicons name="pencil-outline" size={20} color={colours.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={{ marginLeft: 12 }}>
                      <Ionicons name="trash-outline" size={20} color={colours.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.progressRow}>
                  <View style={[styles.progressBar, { backgroundColor: colours.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${percentage}%` as any,
                          backgroundColor: exceeded ? "#2ECC71" : colours.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colours.textLight }]}>
                    {progress}/{item.goal}
                  </Text>
                </View>

                {exceeded ? (
                  <Text style={styles.exceededText}>🎉 Target reached!</Text>
                ) : (
                  <Text style={[styles.remainingText, { color: colours.textLight }]}>
                    {item.goal - progress} remaining
                  </Text>
                )}
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
              {editingTarget ? "Edit Target" : "New Target"}
            </Text>

            <Text style={[styles.label, { color: colours.text }]}>Habit</Text>
            <View style={styles.optionRow}>
              {habitsList.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    styles.optionButton,
                    { borderColor: colours.border, backgroundColor: colours.background },
                    selectedHabit === habit.id && styles.optionSelected,
                  ]}
                  onPress={() => setSelectedHabit(habit.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colours.text },
                      selectedHabit === habit.id && styles.optionTextSelected,
                    ]}
                  >
                    {habit.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colours.text }]}>Type</Text>
            <View style={styles.typeRow}>
              {(["weekly", "monthly"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    { borderColor: colours.border },
                    selectedType === type && styles.typeSelected,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: colours.text },
                      selectedType === type && styles.typeTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colours.text }]}>Goal (number of completions)</Text>
            <TextInput
              style={[styles.input, { borderColor: colours.border, color: colours.text }]}
              placeholder="e.g. 5"
              placeholderTextColor={colours.textLight}
              value={goal}
              onChangeText={setGoal}
              keyboardType="numeric"
              accessibilityLabel="Goal input"
            />

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
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 18, marginTop: 12 },
  emptySubtext: { fontSize: 14, marginTop: 4 },
  targetItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  targetHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  targetInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  badges: { flexDirection: "row", gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  actions: { flexDirection: "row" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBar: { flex: 1, height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  progressText: { fontSize: 13, minWidth: 40, textAlign: "right" },
  exceededText: { fontSize: 13, color: "#2ECC71", marginTop: 6, fontWeight: "600" },
  remainingText: { fontSize: 13, marginTop: 6 },
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
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionSelected: { backgroundColor: "#4A90E2", borderColor: "#4A90E2" },
  optionText: { fontSize: 13 },
  optionTextSelected: { color: "#fff" },
  typeRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  typeSelected: { backgroundColor: "#4A90E2", borderColor: "#4A90E2" },
  typeText: { fontSize: 14, fontWeight: "600" },
  typeTextSelected: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: { flexDirection: "row", gap: 12 },
  button: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
  saveButton: { backgroundColor: "#4A90E2" },
  cancelText: { fontWeight: "600" },
  saveText: { color: "#fff", fontWeight: "600" },
});