import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import FormField from "../../components/FormField";
import { colours, radius, spacing } from "../../constants/theme";
import { db } from "../../db";
import { users } from "../../db/schema";

declare global {
  var userId: number | undefined;
}

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }
    setLoading(true);
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      if (result.length === 0 || result[0].password !== password) {
        Alert.alert("Error", "Invalid username or password");
        return;
      }
      global.userId = result[0].id;
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>✅</Text>
        <Text style={styles.appName}>HabitFlow</Text>
        <Text style={styles.tagline}>Build habits, build yourself</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Welcome back</Text>

        <FormField
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          accessibilityLabel="Username input"
        />
        <FormField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Password input"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.primary,
    justifyContent: "flex-end",
  },
  hero: {
    alignItems: "center",
    paddingBottom: spacing.xl,
    flex: 1,
    justifyContent: "center",
  },
  logo: { fontSize: 64, marginBottom: spacing.sm },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: spacing.xs,
  },
  tagline: { fontSize: 16, color: "rgba(255,255,255,0.8)" },
  card: {
    backgroundColor: colours.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: colours.text,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colours.primary,
    padding: 14,
    borderRadius: radius.sm,
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { color: colours.primary, textAlign: "center", fontSize: 14 },
});