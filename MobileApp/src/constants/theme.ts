import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Base colors that are shared or referenced across themes
const BASE_COLORS = {
  // Primary palette
  teal: {
    lightest: "#E0F7F5",
    light: "#34C6BA",
    main: "#00A99D",
    dark: "#0D8C82",
    darker: "#0A726A",
  },
  gold: {
    light: "#FFD966",
    main: "#F2C94C",
    dark: "#E6B325",
  },

  // Semantic colors
  success: {
    light: "#66BB6A",
    main: "#4CAF50",
    dark: "#388E3C",
  },
  warning: {
    light: "#FFD966",
    main: "#F2C94C",
    dark: "#E6B325",
  },
  error: {
    light: "#EF5350",
    main: "#F44336",
    dark: "#D32F2F",
  },
  info: {
    light: "#42A5F5",
    main: "#2196F3",
    dark: "#1976D2",
  },
};

// Light theme colors
export const LIGHT_COLORS = {
  // Primary color scheme
  primary: BASE_COLORS.teal.main,
  secondary: "#FFFFFF",
  tertiary: BASE_COLORS.teal.dark,

  // Additional accent colors
  accent1: BASE_COLORS.teal.light,
  accent2: BASE_COLORS.gold.main,
  accent3: BASE_COLORS.teal.lightest,

  // Background and surface colors
  background: "#FFFFFF",
  cardBackground: "#F8F9FA",
  headerBackground: BASE_COLORS.teal.main,

  // Text colors
  text: "#1A1A1A",
  textSecondary: "#666666",
  textLight: "#FFFFFF",
  card: "#F8F9FA",

  // Status colors
  success: BASE_COLORS.success.main,
  warning: BASE_COLORS.warning.main,
  error: BASE_COLORS.error.main,
  info: BASE_COLORS.info.main,

  // UI elements
  border: "#E5E5E5",
  overlay: "rgba(0, 0, 0, 0.5)",
  divider: "rgba(0, 0, 0, 0.1)",

  // Gradients and transparencies
  primaryTransparent: "rgba(0, 169, 157, 0.1)",
  secondaryTransparent: "rgba(242, 201, 76, 0.2)",

  // Prayer status colors
  prayerCompleted: BASE_COLORS.success.main,
  prayerNext: BASE_COLORS.warning.main,
  prayerPending: BASE_COLORS.teal.main,
};

// Dark theme colors
export const DARK_COLORS = {
  // Primary color scheme
  primary: BASE_COLORS.teal.main,
  secondary: "#1A1A1A",
  tertiary: BASE_COLORS.teal.light,

  // Additional accent colors
  accent1: BASE_COLORS.teal.dark,
  accent2: BASE_COLORS.gold.dark,
  accent3: BASE_COLORS.teal.darker,

  // Background and surface colors
  background: "#121212",
  cardBackground: "#1E1E1E",
  headerBackground: BASE_COLORS.teal.dark,

  // Text colors
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textLight: "#FFFFFF",
  card: "#1E1E1E",

  // Status colors
  success: BASE_COLORS.success.main,
  warning: BASE_COLORS.warning.main,
  error: BASE_COLORS.error.main,
  info: BASE_COLORS.info.main,

  // UI elements
  border: "#2A2A2A",
  overlay: "rgba(0, 0, 0, 0.7)",
  divider: "rgba(255, 255, 255, 0.1)",

  // Gradients and transparencies
  primaryTransparent: "rgba(0, 169, 157, 0.2)",
  secondaryTransparent: "rgba(242, 201, 76, 0.3)",

  // Prayer status colors
  prayerCompleted: BASE_COLORS.success.main,
  prayerNext: BASE_COLORS.warning.main,
  prayerPending: BASE_COLORS.teal.main,
};

// Shadows
export const SHADOWS = {
  light: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  dark: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  lightDark: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  mediumDark: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  darkDark: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
};

// Sizes
export const SIZES = {
  // Base sizes
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,

  // Typography sizes
  h1: 32,
  h2: 24,
  h3: 20,
  body1: 16,
  body2: 14,
  caption: 12,

  // Spacing
  padding: 16,
  radius: 12,

  // Dimensions
  width,
  height,
};

// Fonts
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const COLORS = LIGHT_COLORS;

export default { COLORS: LIGHT_COLORS, DARK_COLORS, FONTS, SIZES, SHADOWS };
