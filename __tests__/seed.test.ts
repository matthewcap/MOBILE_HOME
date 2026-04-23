describe("Seed Function", () => {
  it("inserts data into all core tables without duplication", () => {
    const insertSpy = jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    const tables = ["users", "categories", "habits", "habitLogs", "targets"];

    tables.forEach((table) => insertSpy(table));

    expect(insertSpy).toHaveBeenCalledTimes(5);
    expect(insertSpy).toHaveBeenCalledWith("users");
    expect(insertSpy).toHaveBeenCalledWith("categories");
    expect(insertSpy).toHaveBeenCalledWith("habits");
    expect(insertSpy).toHaveBeenCalledWith("habitLogs");
    expect(insertSpy).toHaveBeenCalledWith("targets");
  });

  it("does not seed again if records already exist", () => {
    const mockSelect = jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue([{ id: 1 }]),
    });

    const result = mockSelect().from("habits");
    expect(result).toEqual([{ id: 1 }]);
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });
});