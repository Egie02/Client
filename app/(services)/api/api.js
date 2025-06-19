import axiosInstance from '../config/axios.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { 
  AUTH_CONFIG, 
  STORAGE_KEYS, 
  SecurityValidators, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES 
} from '../config/security.config';
import SecureStorageManager from '../utils/SecureStorage';

// OTCPIN Cache invalidation helper
let otcpinCacheInvalidator = null;

// Function to set cache invalidator (called from useOTCPINStatus hook)
export const setOTCPINCacheInvalidator = (invalidatorFunction) => {
  otcpinCacheInvalidator = invalidatorFunction;
};

// Helper to invalidate OTCPIN cache when status changes
const invalidateOTCPINCache = () => {
  if (otcpinCacheInvalidator && typeof otcpinCacheInvalidator === 'function') {
    otcpinCacheInvalidator();
  }
};

const clearUserData = async () => {
  try {
    await SecureStorageManager.multiRemove([
      STORAGE_KEYS.USER_INFO,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.USER_PHONE_NUMBER,
      STORAGE_KEYS.FAILED_ATTEMPTS,
      STORAGE_KEYS.OTCPIN_DISABLED,
      'OTCPIN_GRANTED',
      'biometricCredentials',
      'savedCredentials',
    ]);
    
    return true;
  } catch (error) {
    return false;
  }
};

// Save credentials for biometric authentication using SecureStore
export const saveBiometricCredentials = async (phoneNumber, pin) => {
  try {
    // Validate inputs using security validators
    if (!SecurityValidators.isValidPhoneFormat(phoneNumber)) {
      // Silent error handling
      return false;
    }
    
    const pinValidation = SecurityValidators.validatePin(pin);
    if (!pinValidation.isValid) {
      // Silent error handling
      return false;
    }

    const credentials = {
      phoneNumber,
      pin,
      timestamp: new Date().toISOString(),
      version: '2.0', // Version for future migration compatibility
    };
    
    // Use SecureStore for biometric credentials
    const success = await SecureStorageManager.setItem(
      'biometricCredentials', 
      JSON.stringify(credentials)
    );
    
    if (success) {
      // Silent success - no logging needed
    }
    
    return success;
  } catch (error) {
    // Silent error handling
    return false;
  }
};

// Get saved biometric credentials from SecureStore
export const getBiometricCredentials = async () => {
  try {
    const credentialsString = await SecureStorageManager.getItem('biometricCredentials');
    if (!credentialsString) {
      return null;
    }
    
    const credentials = JSON.parse(credentialsString);
    
    // Check if credentials are older than 30 days (configurable)
    const savedDate = new Date(credentials.timestamp);
    const currentDate = new Date();
    const daysDifference = (currentDate - savedDate) / (1000 * 60 * 60 * 24);
    const maxAge = 30; // days - could be moved to config
    
    if (daysDifference > maxAge) {
      // Silent cleanup of expired credentials
      await SecureStorageManager.removeItem('biometricCredentials');
      return null;
    }
    
    // Validate the stored credentials
    if (!SecurityValidators.isValidPhoneFormat(credentials.phoneNumber)) {
      // Silent cleanup of invalid credentials
      await SecureStorageManager.removeItem('biometricCredentials');
      return null;
    }
    
    const pinValidation = SecurityValidators.validatePin(credentials.pin);
    if (!pinValidation.isValid) {
      // Silent cleanup of invalid credentials
      await SecureStorageManager.removeItem('biometricCredentials');
      return null;
    }
    
    return credentials;
  } catch (error) {
    // Silent error handling
    // Clear potentially corrupted data
    await SecureStorageManager.removeItem('biometricCredentials');
    return null;
  }
};

// Check if biometric credentials exist
export const hasBiometricCredentials = async () => {
  try {
    const credentials = await getBiometricCredentials();
    return !!credentials;
  } catch (error) {
    // Silent error handling
    return false;
  }
};

// Clear biometric credentials from SecureStore
export const clearBiometricCredentials = async () => {
  try {
    const success = await SecureStorageManager.removeItem('biometricCredentials');
    
    // Also clear any legacy credentials storage
    await SecureStorageManager.removeItem('savedCredentials');
    
    if (success) {
      // Silent success - no logging needed
    }
    
    return success;
  } catch (error) {
    // Silent error handling
    return false;
  }
};

// Legacy function - deprecated, use saveBiometricCredentials instead
export const saveCredentialsForBiometric = async (phoneNumber, pin) => {
  // Deprecated function - use saveBiometricCredentials instead
  return await saveBiometricCredentials(phoneNumber, pin);
};

// Legacy function - deprecated, use getBiometricCredentials instead
export const getSavedCredentials = async () => {
  // Deprecated function - use getBiometricCredentials instead
  return await getBiometricCredentials();
};

// Legacy function - deprecated, use clearBiometricCredentials instead
export const clearSavedCredentials = async () => {
  // Deprecated function - use clearBiometricCredentials instead
  return await clearBiometricCredentials();
};

// Helper function to handle API errors
const handleApiError = (error, defaultMessage = 'An error occurred') => {


  let errorMessage = defaultMessage;
  let errorTitle = 'Error';

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    switch (error.response.status) {
      case 400:
        errorTitle = 'Invalid Request';
        errorMessage = error.response.data?.message || 'Invalid request parameters';
        break;
      case 401:
        errorTitle = 'Authentication Error';
        errorMessage = 'Your session has expired. Please login again.';
        break;
      case 403:
        errorTitle = 'Access Denied';
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorTitle = 'Not Found';
        errorMessage = error.response.data?.message || 'The requested resource was not found.';
        break;
      case 429:
        errorTitle = 'Too Many Requests';
        errorMessage = 'Too many attempts. Please try again later.';
        break;
      case 500:
        errorTitle = 'Server Error';
        errorMessage = 'Our servers are experiencing issues. Please try again later.';
        break;
      default:
        errorMessage = error.response.data?.message || defaultMessage;
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorTitle = 'Network Error';
    errorMessage = 'Unable to connect to the server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || defaultMessage;
  }

  // Show alert to user
  Alert.alert(errorTitle, errorMessage);

  // Throw error for handling by the calling function
  throw new Error(errorMessage);
};

// Validate Phone Number Registration with enhanced error handling
export const validatePhoneNumber = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    const response = await axiosInstance.post('/api/validate-phone', {
      phoneNumber: phoneNumber
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Phone validation failed');
    }

    return {
      isRegistered: response.data.data?.isRegistered || false,
      message: response.data.message || 'Phone number validated'
    };
  } catch (error) {
    // If it's a 404, the phone number is not registered
    if (error.response?.status === 404) {
      return {
        isRegistered: false,
        message: 'Phone number is not registered'
      };
    }
    
    handleApiError(error, 'Phone validation failed');
  }
};

// Login User 
export const loginUser = async (user) => {
  try {
    if (!user.PhoneNumber || !user.PIN) {
      throw new Error('Phone number and PIN are required');
    }

    const response = await axiosInstance.post('/api/login', {
      phoneNumber: user.PhoneNumber,
      pin: user.PIN
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Login failed');
    }

    if (!response.data?.data?.user) {
      throw new Error('Invalid response format');
    }

    const userData = {
      user: response.data.data.user,
      token: response.data.data.token
    };

    // Save credentials for biometric authentication
    await saveBiometricCredentials(user.PhoneNumber, user.PIN);

    // Extract OTCPIN data from login response and manage AsyncStorage
    if (response.data.data.user) {
      const userInfo = response.data.data.user;
      
      // Check various possible OTCPIN field formats in the response
      const otcpinStatus = 
        userInfo?.OTCPIN ||
        userInfo?.otcpin ||
        userInfo?.permissions?.OTCPIN ||
        userInfo?.permissions?.otcpin ||
        userInfo?.data?.[0]?.OTCPIN ||
        userInfo?.data?.[0]?.otcpin ||
        null;
      
      // Manage OTCPIN status in AsyncStorage
      if (otcpinStatus) {
        const isOtcpinGranted = otcpinStatus.toUpperCase() === 'GRANTED';
        const isOtcpinEnabled = otcpinStatus.toUpperCase() === 'ENABLED';
        const isOtcpinDisabled = otcpinStatus.toUpperCase() === 'DISABLED';
        
        if (isOtcpinGranted || isOtcpinEnabled) {
          // OTCPIN is granted/enabled - set granted flag and remove disabled flag
          await AsyncStorage.setItem('OTCPIN_GRANTED', 'true');
          await AsyncStorage.removeItem('OTCPIN_DISABLED');
          invalidateOTCPINCache(); // Invalidate cache when status changes
        } else if (isOtcpinDisabled) {
          // OTCPIN is explicitly disabled - set disabled flag and remove granted flag
          await AsyncStorage.setItem('OTCPIN_DISABLED', 'true');
          await AsyncStorage.removeItem('OTCPIN_GRANTED');
          invalidateOTCPINCache(); // Invalidate cache when status changes
        } else {
          // Unknown status - set disabled flag and remove granted flag as safety measure
          await AsyncStorage.setItem('OTCPIN_DISABLED', 'true');
          await AsyncStorage.removeItem('OTCPIN_GRANTED');
          invalidateOTCPINCache(); // Invalidate cache when status changes
        }
      } else {
        // No OTCPIN data found - set disabled flag and remove granted flag as safety measure
        await AsyncStorage.setItem('OTCPIN_DISABLED', 'true');
        await AsyncStorage.removeItem('OTCPIN_GRANTED');
        invalidateOTCPINCache(); // Invalidate cache when status changes
      }
    }

    await Promise.all([
      AsyncStorage.setItem('userInfo', JSON.stringify(userData)),
      AsyncStorage.setItem('userPhoneNumber', user.PhoneNumber)
    ]);
      
    return userData;
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error('Invalid PIN. Please try again.');
        case 404:
          throw new Error('Phone number not found. Please check your phone number.');
        case 429:
          throw new Error('Too many attempts. Please try again later.');
        default:
          throw new Error(error.response.data?.message || 'Login failed. Please try again.');
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }
};

// Get User Data
export const getUserData = async (PhoneNumber) => {
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');

    if (!userInfo) {
      throw new Error('User not authenticated. Please login again.');
    }

    const { token } = JSON.parse(userInfo);
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    if (!PhoneNumber) {
      PhoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      
      if (!PhoneNumber) {
        throw new Error('No phone number available');
      }
    }
    
    const response = await axiosInstance.get(`/api/profile`);
    
    // Extract OTCPIN data from response and manage AsyncStorage
    if (response.data) {
      const userData = response.data;
      
      // Check various possible OTCPIN field formats in the response
      const otcpinStatus = 
        userData?.OTCPIN ||
        userData?.otcpin ||
        userData?.permissions?.OTCPIN ||
        userData?.permissions?.otcpin ||
        userData?.data?.[0]?.OTCPIN ||
        userData?.data?.[0]?.otcpin ||
        null;
      
      // Manage OTCPIN status in AsyncStorage
      if (otcpinStatus) {
        const isOtcpinGranted = otcpinStatus.toUpperCase() === 'GRANTED';
        const isOtcpinEnabled = otcpinStatus.toUpperCase() === 'ENABLED';
        const isOtcpinDisabled = otcpinStatus.toUpperCase() === 'DISABLED';
        
        if (isOtcpinGranted || isOtcpinEnabled) {
          // OTCPIN is granted/enabled - set granted flag and remove disabled flag
          await AsyncStorage.setItem('OTCPIN_GRANTED', 'true');
          await AsyncStorage.removeItem('OTCPIN_DISABLED');
          invalidateOTCPINCache(); // Invalidate cache when status changes
        } else if (isOtcpinDisabled) {
          // OTCPIN is explicitly disabled - set disabled flag and remove granted flag
          await AsyncStorage.setItem('OTCPIN_DISABLED', 'true');
          await AsyncStorage.removeItem('OTCPIN_GRANTED');
          invalidateOTCPINCache(); // Invalidate cache when status changes
        } else {
          // Unknown status - set disabled flag and remove granted flag as safety measure
          await AsyncStorage.setItem('OTCPIN_DISABLED', 'true');
          await AsyncStorage.removeItem('OTCPIN_GRANTED');
          invalidateOTCPINCache(); // Invalidate cache when status changes
        }
      } else {
        // No OTCPIN data found - set disabled flag and remove granted flag as safety measure
        await AsyncStorage.setItem('OTCPIN_DISABLED', 'true');
        await AsyncStorage.removeItem('OTCPIN_GRANTED');
        invalidateOTCPINCache(); // Invalidate cache when status changes
      }
    }
    
    await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    // Silent error handling - error details are shown in alerts
    
    // Handle specific HTTP status codes
    if (error.response?.status === 404) {
      Alert.alert('User Not Found', `User account not found: ${PhoneNumber}. Please contact support.`);
      await clearUserData();
      throw new Error('User account not found');
    } else if (error.response?.status === 401) {
      Alert.alert('Session Expired', 'Your session has expired. Please login again.');
      await clearUserData();
      throw new Error('Session expired');
    } else if (error.response?.status === 403) {
      Alert.alert('Access Denied', 'You do not have permission to access this data.');
      throw new Error('Access denied');
    } else if (error.response?.status >= 500) {
      Alert.alert('Server Error', 'Our servers are experiencing issues. Please try again later.');
      throw new Error('Server error - please try again later');
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      Alert.alert('Network Error', 'Please check your internet connection and try again.');
      throw new Error('Network error - please check your connection');
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      Alert.alert('Request Timeout', 'The request took too long. Please try again.');
      throw new Error('Request timeout - please try again');
    } else {
      // Generic error handling
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user data';
      Alert.alert('Error', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

// Change PIN
export const changePIN = async (PhoneNumber, oldPIN, newPIN, isFirstTime = false) => {
  try {
    if (!PhoneNumber || (!isFirstTime && !oldPIN) || !newPIN) {
      throw new Error('Missing required parameters');
    }

    // Get the token from AsyncStorage for authentication
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (!userInfo) {
      throw new Error('User not authenticated. Please login again.');
    }

    const { token } = JSON.parse(userInfo);
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await axiosInstance.put('/api/profile/auth/pin', {
      phoneNumber: PhoneNumber,
      oldPIN: oldPIN,
      newPIN: newPIN,
      isFirstTime: isFirstTime
    });

    if (!response.data) {
      throw new Error('No response received');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to change PIN');
    }

    // Only clear user data if PIN was changed successfully
    if (response.data.success) {
      await clearUserData();
    }

    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Please login again');
    }
    if (error.response?.status === 403) {
      throw new Error('You can only update your own PIN');
    }
    throw new Error(error.response?.data?.message || error.message || 'PIN change failed');
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await clearUserData();
    return true;
  } catch (error) {
    throw error;
  }
};

export default {
  loginUser,
  getUserData,
  changePIN,
  logoutUser,
  validatePhoneNumber,
  saveBiometricCredentials,
  getBiometricCredentials,
  hasBiometricCredentials,
  clearBiometricCredentials,
  saveCredentialsForBiometric,
  getSavedCredentials,
  clearSavedCredentials,
  setOTCPINCacheInvalidator
};