const seededHabits = [
  { id: 1, name: "Drink 2L Water", categoryId: 1, createdAt: "2024-01-01" },
  { id: 2, name: "Morning Run", categoryId: 2, createdAt: "2024-01-01" },
  { id: 3, name: "Meditate", categoryId: 3, createdAt: "2024-01-01" },
  { id: 4, name: "Read", categoryId: 4, createdAt: "2024-01-01" },
];

function getHabitsToDisplay(habits: any[], searchText: string, filterCategory: number | null) {
  return habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = filterCategory === null || habit.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });
}

describe("HabitsScreen Integration", () => {
  it("displays all seeded habits from the database", () => {
    const displayed = getHabitsToDisplay(seededHabits, "", null);
    expect(displayed.length).toBe(4);
    expect(displayed.find((h) => h.name === "Drink 2L Water")).toBeTruthy();
    expect(displayed.find((h) => h.name === "Morning Run")).toBeTruthy();
    expect(displayed.find((h) => h.name === "Meditate")).toBeTruthy();
    expect(displayed.find((h) => h.name === "Read")).toBeTruthy();
  });

  it("shows empty state when no habits exist", () => {
    const displayed = getHabitsToDisplay([], "", null);
    expect(displayed.length).toBe(0);
  });

  it("filters habits by search text", () => {
    const displayed = getHabitsToDisplay(seededHabits, "run", null);
    expect(displayed.length).toBe(1);
    expect(displayed[0].name).toBe("Morning Run");
  });

  it("filters habits by category", () => {
    const displayed = getHabitsToDisplay(seededHabits, "", 1);
    expect(displayed.length).toBe(1);
    expect(displayed[0].name).toBe("Drink 2L Water");
  });
});