/**
 * Create Themed Styles
 * 
 * Utility function for creating styles that are aware of the current theme.
 * This function works similarly to StyleSheet.create but with theme integration.
 */

import { StyleSheet } from 'react-native';

/**
 * Creates themed styles that can access theme properties
 * @param {Function} styleFactory - Function that receives theme and returns style object
 * @returns {Function} - Function that takes theme and returns StyleSheet
 */
const createThemedStyles = (styleFactory) => {
  // Cache for compiled stylesheets per theme
  const styleCache = new Map();

  return (theme) => {
    // Check if we already have compiled styles for this theme
    const themeId = theme?.id || 'default';
    
    if (styleCache.has(themeId)) {
      return styleCache.get(themeId);
    }

    // Create new styles for this theme
    const styles = styleFactory(theme);
    const compiledStyles = StyleSheet.create(styles);
    
    // Cache the compiled styles
    styleCache.set(themeId, compiledStyles);
    
    return compiledStyles;
  };
};

/**
 * Helper function to create responsive themed styles
 * @param {Function} styleFactory - Function that receives theme and returns style object
 * @returns {Function} - Function that takes theme and returns StyleSheet
 */
export const createResponsiveThemedStyles = (styleFactory) => {
  return createThemedStyles((theme) => {
    const { getScaledSize, getResponsiveWidth } = theme.helpers || {};
    
    return styleFactory({
      ...theme,
      helpers: {
        ...theme.helpers,
        getScaledSize: getScaledSize || ((size) => size),
        getResponsiveWidth: getResponsiveWidth || ((percentage) => `${percentage}%`),
      },
    });
  });
};

/**
 * Helper function to merge theme colors with custom colors
 * @param {Object} theme - Current theme object
 * @param {Object} customColors - Custom color overrides
 * @returns {Object} - Merged colors object
 */
export const mergeThemeColors = (theme, customColors = {}) => {
  return {
    ...theme.colors,
    ...customColors,
  };
};

/**
 * Helper function to get theme-aware shadow styles
 * @param {Object} theme - Current theme object
 * @param {string} shadowSize - Shadow size key (sm, md, lg, xl)
 * @returns {Object} - Platform-specific shadow styles
 */
export const getThemedShadow = (theme, shadowSize = 'md') => {
  return theme.shadows?.[shadowSize] || {};
};

/**
 * Helper function to get theme-aware spacing
 * @param {Object} theme - Current theme object
 * @param {string|number} spacing - Spacing key or custom value
 * @returns {number} - Spacing value
 */
export const getThemedSpacing = (theme, spacing) => {
  if (typeof spacing === 'number') {
    return spacing;
  }
  
  return theme.spacing?.[spacing] || 0;
};

/**
 * Helper function to get theme-aware border radius
 * @param {Object} theme - Current theme object
 * @param {string|number} radius - Border radius key or custom value
 * @returns {number} - Border radius value
 */
export const getThemedBorderRadius = (theme, radius) => {
  if (typeof radius === 'number') {
    return radius;
  }
  
  return theme.borderRadius?.[radius] || 0;
};

/**
 * Helper function to get theme-aware typography
 * @param {Object} theme - Current theme object
 * @param {string} size - Font size key
 * @param {string} weight - Font weight key
 * @returns {Object} - Typography styles
 */
export const getThemedTypography = (theme, size = 'base', weight = 'normal') => {
  return {
    fontSize: theme.typography?.fontSize?.[size] || 14,
    fontWeight: theme.typography?.fontWeight?.[weight] || '400',
  };
};

/**
 * Example usage function for creating themed component styles
 * @param {Object} theme - Current theme object
 * @returns {Object} - Example styled component styles
 */
export const createExampleThemedStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.contrast,
  },
}));

export default createThemedStyles; 