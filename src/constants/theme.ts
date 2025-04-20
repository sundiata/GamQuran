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
  // Primary color scheme - adjusted for dark mode
  primary: "#1ECFC2", // Brighter teal for dark mode
  secondary: "#121212",
  tertiary: "#34C6BA", // Lighter teal for accents in dark mode

  // Additional accent colors
  accent1: "#4DDAD0", // Brighter teal for dark mode
  accent2: BASE_COLORS.gold.light,
  accent3: "#0D3B37", // Very dark teal for backgrounds

  // Background and surface colors
  background: "#121212", // Dark background
  cardBackground: "#1E1E1E", // Slightly lighter dark for cards
  headerBackground: "#0F5E57", // Darker, richer teal for header in dark mode

  // Text colors
  text: "#FFFFFF", // White text for dark mode
  textSecondary: "#AAAAAA", // Light gray for secondary text
  textLight: "#FFFFFF", // White text
  card: "#1E1E1E", // Dark card background

  // Status colors
  success: BASE_COLORS.success.light,
  warning: BASE_COLORS.warning.light,
  error: BASE_COLORS.error.light,
  info: BASE_COLORS.info.light,

  // UI elements
  border: "#333333", // Darker border
  overlay: "rgba(0, 0, 0, 0.7)", // Darker overlay
  divider: "rgba(255, 255, 255, 0.1)", // Light divider for dark mode

  // Gradients and transparencies
  primaryTransparent: "rgba(30, 207, 194, 0.15)", // Adjusted for dark mode
  secondaryTransparent: "rgba(255, 217, 102, 0.25)", // Adjusted for dark mode

  // Prayer status colors
  prayerCompleted: BASE_COLORS.success.light,
  prayerNext: BASE_COLORS.warning.light,
  prayerPending: "#1ECFC2", // Brighter teal for dark mode
};

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
  light: "System",
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 14,
  large: 16,
  extraLarge: 20,
  padding: 24,
  radius: 12,
  width,
  height,
};

// Light theme shadows
const LIGHT_SHADOWS = {
  light: {
    shadowColor: LIGHT_COLORS.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: LIGHT_COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dark: {
    shadowColor: LIGHT_COLORS.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Dark theme shadows
const DARK_SHADOWS = {
  light: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  dark: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const SHADOWS = {
  ...LIGHT_SHADOWS,
  lightDark: DARK_SHADOWS.light,
  mediumDark: DARK_SHADOWS.medium,
  darkDark: DARK_SHADOWS.dark,
};

// For backward compatibility
export const COLORS = LIGHT_COLORS;

export default { COLORS: LIGHT_COLORS, DARK_COLORS, FONTS, SIZES, SHADOWS };
