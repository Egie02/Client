import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserData } from "../(services)/api/api";
// import { Alert } from 'react-native';

// Load user from AsyncStorage
// const loadUserFromStorage = async () => {
//   try {
//     const userDataString = await AsyncStorage.getItem("userData");  
//     if (userDataString) {
//       const parsedData = JSON.parse(userDataString);
//       // Handle both old and new data formats
//       if (parsedData?.success && parsedData?.data) {
//         return parsedData.data; // New format from API
//       }
//       return parsedData; // Old format or direct data
//     }
//     return null;
//   } catch (error) { 
//     console.error('Error loading user from storage:', error);
//     return null;
//   }
// };

const initialState = {
  user: null,
  loading: true,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginAction: (state, action) => {
      // Extract user data from login response
      const userData = action.payload?.user || action.payload;
      state.user = userData;
      state.loading = false;
      state.error = null;
      // Store the user data directly, not the entire response
      AsyncStorage.setItem("userData", JSON.stringify(userData));
    },
    logoutAction: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      AsyncStorage.multiRemove(["userData", "userPhoneNumber", "userInfo"]);
    },
    setUser: (state, action) => {
      // Handle API response format: {success: true, data: {...}}
      let userData = action.payload;
      if (action.payload?.success && action.payload?.data) {
        userData = action.payload.data;
      }
      
      state.user = userData;
      state.loading = false;
      state.error = null;
      AsyncStorage.setItem("userData", JSON.stringify(userData));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
});

export const {
  loginAction,
  logoutAction,
  setUser,
  setLoading,
  setError
} = authSlice.actions;

export default authSlice.reducer;

// Helper function to fetch and process user data
const fetchUserData = async (phoneNumber, dispatch) => {
  try {
    const response = await getUserData(phoneNumber);
    if (response) {
      dispatch(setUser(response));
    } else {
      dispatch(setError("User not found"));
      dispatch(logoutAction());
    }
  } catch (error) {
    // Silent error handling - error details are captured in state
    
    if (error.message?.includes('not found')) {
      dispatch(setError("User account no longer exists"));
    } else if (error.message?.includes('not authenticated')) {
      dispatch(setError("Session expired"));
    } else {
      dispatch(setError("Failed to load user data"));
    }
    dispatch(logoutAction());
  }
};

// Thunk for loading the user initially
export const loadUser = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    // Clear all cached data on app reload
    await AsyncStorage.multiRemove(["userData", "userInfo"]);
    
    // Check if we have a phone number for potential manual refresh
    const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
    
    if (phoneNumber) {
      // We have a phone number but won't auto-fetch
      // User will need to manually refresh or login again
      dispatch(setLoading(false));
    } else {
      // No phone number available, user needs to login
      dispatch(setLoading(false));
    }
  } catch (error) {
    // Silent error handling - error details are captured in state
    dispatch(setError("Failed to initialize app"));
    dispatch(setLoading(false));
  }
};

// Thunk for refreshing user data
export const refreshUserData = () => async (dispatch, getState) => {
  dispatch(setLoading(true));

  try {
    const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
    if (!phoneNumber) {
      throw new Error('No phone number available for refresh');
    }
    
    await fetchUserData(phoneNumber, dispatch);
  } catch (error) {
    // Silent error handling - error details are captured in state
    dispatch(setError("Failed to refresh user data")); 
    dispatch(logoutAction());
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk for manually loading user data (when user explicitly requests it)
export const manualLoadUser = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    // Get phone number for fetching fresh data
    const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
    
    if (phoneNumber) {
      // Fetch fresh user data
      await fetchUserData(phoneNumber, dispatch);
    } else {
      // No phone number available, user needs to login
      dispatch(setError("Please login to load your data"));
      dispatch(setLoading(false));
    }
  } catch (error) {
    // Silent error handling - error details are captured in state
    dispatch(setError("Failed to load user data"));
    dispatch(setLoading(false));
  }
};

// Enhanced login action that automatically loads fresh user data
export const loginAndLoadUser = (loginResponse) => async (dispatch) => {
  try {
    // First, set the login data
    dispatch(loginAction(loginResponse));
    
    // Then automatically load fresh user data
    const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
    if (phoneNumber) {
      await fetchUserData(phoneNumber, dispatch);
    }
  } catch (error) {
    // Silent error handling - error details are captured in state
    // If loading fresh data fails, keep the login data but show error
    dispatch(setError("Login successful, but failed to load latest data. Please refresh."));
  }
};
