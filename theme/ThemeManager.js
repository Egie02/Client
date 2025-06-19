import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors as defaultColors } from './defaultTheme/colors';
import { getSharesTier, getTierColors, getTierInfo } from './tierThemes/tierColors';
import { getUserData } from '../utils/userDataSchema';

const ThemeContext = createContext();

export const THEME_TYPES = {
  DEFAULT: 'default',
  TIER: 'tier'
};

const THEME_PREFERENCE_KEY = '@theme_preference';

// Theme Manager Provider Component
export const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Theme state
  const [themeType, setThemeType] = useState(THEME_TYPES.DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  
  // User's tier information
  const userShares = getUserData.getShares(user);
  const userTier = getSharesTier(userShares);
  const tierInfo = getTierInfo(userTier);
  const tierColors = getTierColors(userTier);

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
      if (savedTheme && Object.values(THEME_TYPES).includes(savedTheme)) {
        setThemeType(savedTheme);
      }
    } catch (error) {
      // Silent error handling for theme preference loading
    } finally {
      setIsLoading(false);
    }
  };

  // Save theme preference to storage
  const saveThemePreference = async (theme) => {
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, theme);
    } catch (error) {
      // Silent error handling for theme preference saving
    }
  };

  // Switch theme function
  const switchTheme = async (newThemeType) => {
    if (Object.values(THEME_TYPES).includes(newThemeType)) {
      setThemeType(newThemeType);
      await saveThemePreference(newThemeType);
    }
  };

  // Toggle between default and tier theme
  const toggleTheme = async () => {
    const newTheme = themeType === THEME_TYPES.DEFAULT ? THEME_TYPES.TIER : THEME_TYPES.DEFAULT;
    await switchTheme(newTheme);
  };

  // Get current theme colors
  const getCurrentTheme = () => {
    if (themeType === THEME_TYPES.TIER && user) {
      return {
        type: THEME_TYPES.TIER,
        colors: tierColors,
        tier: userTier,
        tierInfo: tierInfo,
        isDefault: false
      };
    }
    
    return {
      type: THEME_TYPES.DEFAULT,
      colors: defaultColors,
      tier: null,
      tierInfo: null,
      isDefault: true
    };
  };

  // Get theme-aware styles
  const getThemedStyles = (styleFunction) => {
    const currentTheme = getCurrentTheme();
    return styleFunction(currentTheme.colors, currentTheme);
  };

  // Create gradient colors for tier themes
  const getGradientColors = () => {
    const currentTheme = getCurrentTheme();
    if (currentTheme.type === THEME_TYPES.TIER) {
      return [currentTheme.colors.start, currentTheme.colors.middle, currentTheme.colors.end];
    }
    return [defaultColors.primary.main, defaultColors.primary.dark, defaultColors.primary.darker];
  };

  // Get header colors based on theme
  const getHeaderColors = () => {
    const currentTheme = getCurrentTheme();
    if (currentTheme.type === THEME_TYPES.TIER) {
      return {
        backgroundColor: currentTheme.colors.middle,
        tintColor: currentTheme.colors.contrast,
        gradient: getGradientColors()
      };
    }
    return {
      backgroundColor: defaultColors.primary.main,
      tintColor: defaultColors.text.contrast,
      gradient: getGradientColors()
    };
  };

  // Get drawer colors based on theme
  const getDrawerColors = () => {
    const currentTheme = getCurrentTheme();
    if (currentTheme.type === THEME_TYPES.TIER) {
      return {
        backgroundColor: currentTheme.colors.surface,
        activeBackgroundColor: currentTheme.colors.middle,
        activeTintColor: currentTheme.colors.contrast,
        inactiveTintColor: currentTheme.colors.dark,
        headerGradient: getGradientColors()
      };
    }
    return {
      backgroundColor: defaultColors.background.paper,
      activeBackgroundColor: defaultColors.primary.main,
      activeTintColor: defaultColors.text.contrast,
      inactiveTintColor: defaultColors.text.primary,
      headerGradient: getGradientColors()
    };
  };

  // Theme context value
  const themeValue = {
    // Theme state
    themeType,
    isLoading,
    
    // User tier info
    userTier,
    tierInfo,
    userShares,
    
    // Theme functions
    switchTheme,
    toggleTheme,
    getCurrentTheme,
    getThemedStyles,
    getGradientColors,
    getHeaderColors,
    getDrawerColors,
    
    // Current theme data
    ...getCurrentTheme()
  };

  if (isLoading) {
    return null; // Or a loading component
  }

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// HOC for theme-aware components
export const withTheme = (Component) => {
  return React.forwardRef((props, ref) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} ref={ref} />;
  });
};

// Theme-aware style creator
export const createThemedStyles = (styleFunction) => {
  return (theme) => styleFunction(theme.colors, theme);
};

// Utility functions
export const formatTierName = (tierName) => {
  if (!tierName) return 'Bronze Member';
  
  const tierLabels = {
    bronze: 'Bronze Member',
    silver: 'Silver Member', 
    gold: 'Gold Member',
    roseGold: 'Rose Gold Member',
    platinum: 'Platinum Member',
    sapphire: 'Sapphire Member',
    emerald: 'Emerald Member',
    ruby: 'Ruby Member',
    diamond: 'Diamond Member'
  };
  
  return tierLabels[tierName] || 'Bronze Member';
};

export const getTierIcon = (tierName) => {
  const tierIcons = {
    bronze: 'medal',
    silver: 'medal-outline',
    gold: 'trophy',
    roseGold: 'trophy-outline',
    platinum: 'star',
    sapphire: 'star-outline',
    emerald: 'diamond',
    ruby: 'diamond-outline',
    diamond: 'crown'
  };
  
  return tierIcons[tierName] || 'medal';
};

export default {
  ThemeProvider,
  useTheme,
  withTheme,
  createThemedStyles,
  THEME_TYPES,
  formatTierName,
  getTierIcon
}; 