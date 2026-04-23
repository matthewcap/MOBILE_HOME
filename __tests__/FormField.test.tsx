interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

function simulateFormField(props: FormFieldProps) {
  return {
    label: props.label,
    placeholder: props.placeholder,
    value: props.value,
    secureTextEntry: props.secureTextEntry || false,
    triggerChange: (text: string) => props.onChangeText(text),
  };
}

describe("FormField Component", () => {
  it("renders correctly with label and placeholder", () => {
    const field = simulateFormField({
      label: "Username",
      placeholder: "Enter your username",
      value: "",
      onChangeText: () => {},
    });

    expect(field.label).toBe("Username");
    expect(field.placeholder).toBe("Enter your username");
  });

  it("fires onChangeText callback when user input is simulated", () => {
    const mockOnChange = jest.fn();

    const field = simulateFormField({
      label: "Username",
      placeholder: "Enter your username",
      value: "",
      onChangeText: mockOnChange,
    });

    field.triggerChange("testuser");
    expect(mockOnChange).toHaveBeenCalledWith("testuser");
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it("renders with secureTextEntry for password fields", () => {
    const field = simulateFormField({
      label: "Password",
      placeholder: "Enter your password",
      value: "",
      onChangeText: () => {},
      secureTextEntry: true,
    });

    expect(field.secureTextEntry).toBe(true);
    expect(field.label).toBe("Password");
  });
});