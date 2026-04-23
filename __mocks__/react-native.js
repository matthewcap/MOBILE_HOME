const React = require("react");

const View = ({ children }) => React.createElement("div", null, children);
const Text = ({ children }) => React.createElement("span", null, children);
const TextInput = ({ placeholder, onChangeText, value }) =>
  React.createElement("input", {
    placeholder,
    value,
    onChange: (e) => onChangeText && onChangeText(e.target.value),
  });
const TouchableOpacity = ({ children, onPress }) =>
  React.createElement("button", { onClick: onPress }, children);
const ScrollView = ({ children }) => React.createElement("div", null, children);
const FlatList = ({ data, renderItem, keyExtractor }) =>
  React.createElement(
    "div",
    null,
    data.map((item, index) =>
      React.createElement(
        "div",
        { key: keyExtractor ? keyExtractor(item, index) : index },
        renderItem({ item, index })
      )
    )
  );
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
    if (!style) return {};
    if (Array.isArray(style)) return Object.assign({}, ...style.map(StyleSheet.flatten));
    return style;
  },
  hairlineWidth: 1,
  absoluteFill: {},
};
const Alert = { alert: jest.fn() };
const Dimensions = { get: () => ({ width: 375, height: 812 }) };

module.exports = {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
  Platform: { OS: "ios" },
};