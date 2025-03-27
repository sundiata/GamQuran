import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#4A5B9B',
  secondary: '#E0C853',
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E5E5E5',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  card: '#F8F9FA',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
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

export const SHADOWS = {
  light: {
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dark: {
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default { COLORS, FONTS, SIZES, SHADOWS };
