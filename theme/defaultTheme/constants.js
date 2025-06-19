/**
 * Theme Management Constants
 * 
 * This file contains constants used throughout the theme management system.
 */

// Available theme identifiers
export const THEME_TYPES = {
  DEFAULT: 'default',
  DARK: 'dark',
  LIGHT: 'light',
  HIGH_CONTRAST: 'highContrast',
  CUSTOM: 'custom',
};

// Theme storage key for AsyncStorage
export const THEME_STORAGE_KEY = '@app_theme_preference';

// Default theme identifier
export const DEFAULT_THEME = THEME_TYPES.DEFAULT;

// Theme transition duration (in milliseconds)
export const THEME_TRANSITION_DURATION = 300;

// Supported theme properties
export const THEME_PROPERTIES = {
  COLORS: 'colors',
  TYPOGRAPHY: 'typography',
  SPACING: 'spacing',
  SHADOWS: 'shadows',
  BORDERS: 'borders',
};

// Theme categories for organization
export const THEME_CATEGORIES = {
  SYSTEM: 'system',
  ACCESSIBILITY: 'accessibility',
  CUSTOM: 'custom',
}; 