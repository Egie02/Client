/**
 * Theme Definitions
 * 
 * This file contains all available themes for the application.
 * The default theme is based on the current application styling.
 */

import { Platform, Dimensions } from 'react-native';
import { THEME_TYPES } from './constants';

// Helper functions for responsive sizing (from current style.js)
const getScaledSize = (baseSize) => {
  const { width } = Dimensions.get('window');
  const baseWidth = 375; // Base width for iPhone
  const scaleFactor = Math.min(width / baseWidth, 1.5); // Cap scale factor
  return Math.round(baseSize * scaleFactor);
};

const getResponsiveWidth = (percentage) => {
  const { width } = Dimensions.get('window');
  return width * (percentage / 100);
};

// Base theme structure
const createBaseTheme = (colors) => ({
  colors,
  typography: {
    // Font sizes
    fontSize: {
      xs: getScaledSize(10),
      sm: getScaledSize(12),
      base: getScaledSize(14),
      lg: getScaledSize(16),
      xl: getScaledSize(18),
      '2xl': getScaledSize(20),
      '3xl': getScaledSize(24),
      '4xl': getScaledSize(28),
      '5xl': getScaledSize(32),
    },
    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  },
  spacing: {
    xs: getScaledSize(4),
    sm: getScaledSize(8),
    md: getScaledSize(12),
    lg: getScaledSize(16),
    xl: getScaledSize(20),
    '2xl': getScaledSize(24),
    '3xl': getScaledSize(32),
    '4xl': getScaledSize(40),
    '5xl': getScaledSize(48),
  },
  borderRadius: {
    none: 0,
    sm: getScaledSize(4),
    md: getScaledSize(8),
    lg: getScaledSize(12),
    xl: getScaledSize(16),
    '2xl': getScaledSize(20),
    '3xl': getScaledSize(24),
    full: 9999,
  },
  shadows: {
    sm: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    md: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
    lg: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    xl: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  helpers: {
    getScaledSize,
    getResponsiveWidth,
  },
});

// Default theme colors (based on current application colors)
const defaultColors = {
  // Primary Colors
  primary: {
    main: '#303481',
    light: '#4A4D9B',
    dark: '#1E2167',
    contrast: '#FFFFFF',
  },

  // Secondary Colors
  secondary: {
    main: '#E0F7FA',
    light: '#F0F4C3',
    dark: '#B2EBF2',
    contrast: '#0F172A',
  },

  // Text Colors
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    disabled: '#94A3B8',
    contrast: '#FFFFFF',
  },

  // Background Colors
  background: {
    default: '#E0F7FA',
    paper: '#FFFFFF',
    card: '#F8FAFC',
  },

  // Border Colors
  border: {
    main: '#E2E8F0',
    light: '#F1F5F9',
    dark: '#CBD5E1',
  },

  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Additional Colors
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',

  // Membership Tier Colors
  tier: {
    bronze: {
      start: '#CD7F32',
      middle: '#B87333',
      end: '#8B4513'
    },
    silver: {
      start: '#E8E8E8',
      middle: '#C0C0C0', 
      end: '#A9A9A9'
    },
    gold: {
      start: '#FFD700',
      middle: '#FFC000',
      end: '#DAA520'
    },
    roseGold: {
        start: '#FFE4E1',
        middle: '#EE9A9A',
        end: '#B76E79'
    },
    platinum: {
      start: '#F5F5F5',
      middle: '#E5E4E2',
      end: '#C0C0C0'
    },
    sapphire: {
        start: '#082567',
        middle: '#0F52BA',
        end: '#0066FF'  
    },
    emerald: {
      start: '#50C878',
      middle: '#4BC67D', 
      end: '#2E8B57'
    },
    ruby: {
      start: '#E0115F',
      middle: '#CC0033',
      end: '#9B111E'
    },    
    diamond: {
        start: '#E0FFFF',
        middle: '#B9F2FF',
        end: '#87CEEB'
    }
  },
};

// Dark theme colors
const darkColors = {
  ...defaultColors,
  primary: {
    main: '#4A4D9B',
    light: '#6366F1',
    dark: '#303481',
    contrast: '#FFFFFF',
  },
  secondary: {
    main: '#1F2937',
    light: '#374151',
    dark: '#111827',
    contrast: '#F9FAFB',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    disabled: '#9CA3AF',
    contrast: '#111827',
  },
  background: {
    default: '#111827',
    paper: '#1F2937',
    card: '#374151',
  },
  border: {
    main: '#374151',
    light: '#4B5563',
    dark: '#1F2937',
  },
};

// Light theme colors
const lightColors = {
  ...defaultColors,
  background: {
    default: '#FFFFFF',
    paper: '#F9FAFB',
    card: '#FFFFFF',
  },
  secondary: {
    main: '#F9FAFB',
    light: '#FFFFFF',
    dark: '#F3F4F6',
    contrast: '#111827',
  },
};

// High contrast theme colors
const highContrastColors = {
  ...defaultColors,
  primary: {
    main: '#000000',
    light: '#333333',
    dark: '#000000',
    contrast: '#FFFFFF',
  },
  text: {
    primary: '#000000',
    secondary: '#333333',
    disabled: '#666666',
    contrast: '#FFFFFF',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
    card: '#F5F5F5',
  },
  border: {
    main: '#000000',
    light: '#333333',
    dark: '#000000',
  },
};

// Theme definitions
const themes = {
  [THEME_TYPES.DEFAULT]: {
    id: THEME_TYPES.DEFAULT,
    name: 'Default',
    description: 'The default application theme with teal and blue colors',
    category: 'system',
    ...createBaseTheme(defaultColors),
  },
  
  [THEME_TYPES.DARK]: {
    id: THEME_TYPES.DARK,
    name: 'Dark',
    description: 'Dark theme for low-light environments',
    category: 'system',
    ...createBaseTheme(darkColors),
  },
  
  [THEME_TYPES.LIGHT]: {
    id: THEME_TYPES.LIGHT,
    name: 'Light',
    description: 'Clean light theme with minimal colors',
    category: 'system',
    ...createBaseTheme(lightColors),
  },
  
  [THEME_TYPES.HIGH_CONTRAST]: {
    id: THEME_TYPES.HIGH_CONTRAST,
    name: 'High Contrast',
    description: 'High contrast theme for better accessibility',
    category: 'accessibility',
    ...createBaseTheme(highContrastColors),
  },
};

export default themes; 