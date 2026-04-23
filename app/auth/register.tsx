import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FormField from "../../components/FormField";
import { colours, radius, spacing } from "../../constants/theme";
import { db } from "../../db";
import { users } from "../../db/schema";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password || !confirm) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      if (existing.length > 0) {
        Alert.alert("Error", "Username already taken");
        return;
      }

      await db.insert(users).values({
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Account created! Please login.");
      router.replace("/auth/login");
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
        <Text style={styles.tagline}>Start your journey today</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Create Account</Text>

        <FormField
          label="Username"
          placeholder="Choose a username"
          value={username}
          onChangeText={setUsername}
          accessibilityLabel="Username input"
        />
        <FormField
          label="Password"
          placeholder="Choose a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Password input"
        />
        <FormField
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          accessibilityLabel="Confirm password input"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating account..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/auth/login")}>
          <Text style={styles.link}>Already have an account? Login</Text>
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