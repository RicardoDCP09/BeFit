// Be Fit Color Palette - Orange Theme
const primary = '#FF9800'; // Orange - Energy (Primary)
const primaryLight = '#FFB74D'; // Light Orange
const primaryDark = '#F57C00'; // Dark Orange
const secondary = '#2196F3'; // Blue - Calm
const accent = '#4CAF50'; // Green - Health (now accent)

export default {
  light: {
    text: '#1a1a1a',
    textSecondary: '#666666',
    background: '#f8f9fa',
    card: '#ffffff',
    tint: primary,
    primary,
    primaryLight,
    primaryDark,
    secondary,
    accent,
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    border: '#e0e0e0',
    tabIconDefault: '#9e9e9e',
    tabIconSelected: primary,
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    background: '#0d0d0d',
    card: '#1a1a1a',
    tint: primaryLight,
    primary: primaryLight,
    primaryLight,
    primaryDark,
    secondary: '#64B5F6',
    accent: '#81C784',
    success: '#81C784',
    warning: '#FFD54F',
    error: '#E57373',
    border: '#2a2a2a',
    tabIconDefault: '#666666',
    tabIconSelected: primaryLight,
  },
};
