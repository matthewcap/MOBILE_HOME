import { Stack } from "expo-router";
import { useEffect } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { initDB } from "../db";
import { seedDatabase } from "../db/seed";

export default function RootLayout() {
  useEffect(() => {
    const setup = async () => {
      await initDB();
      await seedDatabase();
    };
    setup();
  }, []);

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}