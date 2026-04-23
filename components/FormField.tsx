import { StyleSheet, Text, TextInput, View } from "react-native";
import { colours, radius, spacing } from "../constants/theme";

interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  accessibilityLabel?: string;
}

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  accessibilityLabel,
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colours.textLight}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel || label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colours.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colours.border,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 16,
    color: colours.text,
    backgroundColor: colours.card,
  },
});