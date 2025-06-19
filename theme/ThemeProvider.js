/**
 * Theme Provider
 * 
 * React Context provider for managing application themes.
 * Handles theme switching, persistence, and provides theme context to components.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themes from './themes';
import { THEME_TYPES, THEME_STORAGE_KEY, DEFAULT_THEME } from './constants';

// Theme Context
const ThemeContext = createContext();

// Theme Actions
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

// Theme Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        currentTheme: action.payload.themeId,
        theme: action.payload.theme,
        loading: false,
        error: null,
      };
    case THEME_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case THEME_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  currentTheme: DEFAULT_THEME,
  theme: themes[DEFAULT_THEME],
  loading: true,
  error: null,
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load saved theme on app start
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      dispatch({ type: THEME_ACTIONS.SET_LOADING, payload: true });
      
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const themeId = savedTheme || DEFAULT_THEME;
      
      if (themes[themeId]) {
        dispatch({
          type: THEME_ACTIONS.SET_THEME,
          payload: {
            themeId,
            theme: themes[themeId],
          },
        });
      } else {
        // Fallback to default theme if saved theme doesn't exist
        dispatch({
          type: THEME_ACTIONS.SET_THEME,
          payload: {
            themeId: DEFAULT_THEME,
            theme: themes[DEFAULT_THEME],
          },
        });
      }
    } catch (error) {
      // Silent error handling - error is already captured in state
      dispatch({
        type: THEME_ACTIONS.SET_ERROR,
        payload: 'Failed to load saved theme',
      });
      // Fallback to default theme
      dispatch({
        type: THEME_ACTIONS.SET_THEME,
        payload: {
          themeId: DEFAULT_THEME,
          theme: themes[DEFAULT_THEME],
        },
      });
    }
  };

  const setTheme = async (themeId) => {
    try {
      if (!themes[themeId]) {
        throw new Error(`Theme "${themeId}" does not exist`);
      }

      dispatch({ type: THEME_ACTIONS.SET_LOADING, payload: true });

      // Save theme preference
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);

      // Update current theme
      dispatch({
        type: THEME_ACTIONS.SET_THEME,
        payload: {
          themeId,
          theme: themes[themeId],
        },
      });
    } catch (error) {
      // Silent error handling - error is already captured in state
      dispatch({
        type: THEME_ACTIONS.SET_ERROR,
        payload: 'Failed to set theme',
      });
    }
  };

  const resetTheme = async () => {
    try {
      await AsyncStorage.removeItem(THEME_STORAGE_KEY);
      dispatch({
        type: THEME_ACTIONS.SET_THEME,
        payload: {
          themeId: DEFAULT_THEME,
          theme: themes[DEFAULT_THEME],
        },
      });
    } catch (error) {
      // Silent error handling - error is already captured in state
      dispatch({
        type: THEME_ACTIONS.SET_ERROR,
        payload: 'Failed to reset theme',
      });
    }
  };

  const getAvailableThemes = () => {
    return Object.values(themes).map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      category: theme.category,
    }));
  };

  const isThemeActive = (themeId) => {
    return state.currentTheme === themeId;
  };

  const value = {
    // State
    currentTheme: state.currentTheme,
    theme: state.theme,
    loading: state.loading,
    error: state.error,
    
    // Actions
    setTheme,
    resetTheme,
    
    // Utilities
    getAvailableThemes,
    isThemeActive,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeProvider; 