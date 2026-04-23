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
import { categories } from "../../db/schema";

const COLOURS = [
  "#E74C3C", "#E67E22", "#F1C40F", "#2ECC71",
  "#1ABC9C", "#3498DB", "#4A90E2", "#9B59B6",
  "#E91E63", "#FF5722",
];

const ICONS = [
  "heart", "barbell", "leaf", "book", "star",
  "moon", "sunny", "water", "bicycle", "walk",
];

export default function CategoriesScreen() {
  const { colours } = useTheme();
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState("");
  const [selectedColour, setSelectedColour] = useState(COLOURS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await db.select().from(categories);
    setCategoriesList(result);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setSelectedColour(COLOURS[0]);
    setSelectedIcon(ICONS[0]);
    setModalVisible(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setName(category.name);
    setSelectedColour(category.colour);
    setSelectedIcon(category.icon || ICONS[0]);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }
    if (editingCategory) {
      await db
        .update(categories)
        .set({ name, colour: selectedColour, icon: selectedIcon })
        .where(eq(categories.id, editingCategory.id));
    } else {
      await db.insert(categories).values({
        name,
        colour: selectedColour,
        icon: selectedIcon,
      });
    }
    setModalVisible(false);
    loadCategories();
  };

  const handleDelete = (category: any) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.delete(categories).where(eq(categories.id, category.id));
            loadCategories();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colours.background }]}>
      <Text style={[styles.title, { color: colours.text }]}>Categories</Text>

      {categoriesList.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="folder-open-outline" size={48} color={colours.textLight} />
          <Text style={[styles.emptyText, { color: colours.textLight }]}>No categories yet</Text>
          <Text style={[styles.emptySubtext, { color: colours.textLight }]}>Add one to get started</Text>
        </View>
      ) : (
        <FlatList
          data={categoriesList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.categoryItem, { backgroundColor: colours.card }]}>
              <View style={[styles.iconBadge, { backgroundColor: item.colour }]}>
                <Ionicons name={item.icon || "folder"} size={20} color="#fff" />
              </View>
              <Text style={[styles.categoryName, { color: colours.text }]}>{item.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Ionicons name="pencil-outline" size={20} color={colours.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={{ marginLeft: 12 }}>
                  <Ionicons name="trash-outline" size={20} color={colours.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colours.card }]}>
            <Text style={[styles.modalTitle, { color: colours.text }]}>
              {editingCategory ? "Edit Category" : "New Category"}
            </Text>

            <TextInput
              style={[styles.input, { borderColor: colours.border, color: colours.text }]}
              placeholder="Category name"
              placeholderTextColor={colours.textLight}
              value={name}
              onChangeText={setName}
              accessibilityLabel="Category name input"
            />

            <Text style={[styles.label, { color: colours.text }]}>Colour</Text>
            <View style={styles.colourRow}>
              {COLOURS.map((colour) => (
                <TouchableOpacity
                  key={colour}
                  style={[
                    styles.colourCircle,
                    { backgroundColor: colour },
                    selectedColour === colour && styles.colourSelected,
                  ]}
                  onPress={() => setSelectedColour(colour)}
                />
              ))}
            </View>

            <Text style={[styles.label, { color: colours.text }]}>Icon</Text>
            <View style={styles.iconRow}>
              {ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    { backgroundColor: colours.background },
                    selectedIcon === icon && styles.iconSelected,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons
                    name={icon as any}
                    size={22}
                    color={selectedIcon === icon ? "#fff" : colours.text}
                  />
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
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
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
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryName: { flex: 1, fontSize: 16 },
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
  colourRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  colourCircle: { width: 32, height: 32, borderRadius: 16, margin: 4 },
  colourSelected: { borderWidth: 3, borderColor: "#333" },
  iconRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
  },
  iconSelected: { backgroundColor: "#4A90E2" },
  modalButtons: { flexDirection: "row", gap: 12 },
  button: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
  saveButton: { backgroundColor: "#4A90E2" },
  cancelText: { fontWeight: "600" },
  saveText: { color: "#fff", fontWeight: "600" },
});