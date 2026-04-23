module.exports = {
  openDatabaseSync: () => ({
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue(undefined),
  }),
};