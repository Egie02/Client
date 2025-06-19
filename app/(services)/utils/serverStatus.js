import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkServerHealth } from '../api/api';

// Server status utility functions
export class ServerStatusManager {
  static SERVER_STATUS_KEY = 'serverStatus';
  static LAST_CHECK_KEY = 'lastServerCheck';
  static CHECK_INTERVAL = 30000; // 30 seconds

  // Check if server is currently down
  static async isServerDown() {
    try {
      const lastCheck = await AsyncStorage.getItem(this.LAST_CHECK_KEY);
      const serverStatus = await AsyncStorage.getItem(this.SERVER_STATUS_KEY);
      
      const now = Date.now();
      const lastCheckTime = lastCheck ? parseInt(lastCheck) : 0;
      
      // If we haven't checked recently, perform a new check
      if (now - lastCheckTime > this.CHECK_INTERVAL) {
        return await this.performServerCheck();
      }
      
      // Return cached status
      return serverStatus === 'down';
    } catch (error) {
      // Silent error handling - return offline status
      return false;
    }
  }

  // Perform actual server health check
  static async performServerCheck() {
    try {
      const healthCheck = await checkServerHealth();
      const now = Date.now();
      
      await AsyncStorage.setItem(this.LAST_CHECK_KEY, now.toString());
      await AsyncStorage.setItem(
        this.SERVER_STATUS_KEY, 
        healthCheck.isOnline ? 'online' : 'down'
      );
      
      return !healthCheck.isOnline;
    } catch (error) {
      // Silent error handling - return unhealthy status
      await AsyncStorage.setItem(this.SERVER_STATUS_KEY, 'down');
      return true;
    }
  }

  // Show server down alert
  static showServerDownAlert() {
    Alert.alert(
      'Server Unavailable',
      'The server is currently down or unreachable. Please check your internet connection and try again later.',
      [
        {
          text: 'Retry',
          onPress: () => this.performServerCheck()
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    );
  }

  // Show network error alert
  static showNetworkErrorAlert() {
    Alert.alert(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection and try again.',
      [
        {
          text: 'Retry',
          onPress: () => this.performServerCheck()
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    );
  }

  // Clear server status cache
  static async clearServerStatusCache() {
    try {
      await AsyncStorage.multiRemove([this.SERVER_STATUS_KEY, this.LAST_CHECK_KEY]);
    } catch (error) {
      // Silent error handling during cache clearing
    }
  }

  // Get server status message
  static async getServerStatusMessage() {
    const isDown = await this.isServerDown();
    if (isDown) {
      return 'Server is currently unavailable';
    }
    return 'Server is online';
  }
}

// Error classification utility
export const classifyError = (error) => {
  const errorInfo = {
    type: 'unknown',
    message: error.message || 'An unknown error occurred',
    isServerDown: false,
    isNetworkError: false,
    isTimeout: false,
    isServerError: false
  };

  // Check for server down indicators
  if (error.isServerDown || 
      error.message?.includes('Server is currently unavailable') ||
      error.message?.includes('server down') ||
      error.message?.includes('unreachable')) {
    errorInfo.type = 'server_down';
    errorInfo.isServerDown = true;
    errorInfo.message = 'Server is currently down or unreachable';
  }
  // Check for network errors
  else if (error.message?.includes('Network Error') || 
           error.message?.includes('network') ||
           error.code === 'NETWORK_ERROR') {
    errorInfo.type = 'network_error';
    errorInfo.isNetworkError = true;
    errorInfo.message = 'Network connection error';
  }
  // Check for timeout errors
  else if (error.isTimeout || 
           error.message?.includes('timeout') ||
           error.code === 'ECONNABORTED') {
    errorInfo.type = 'timeout';
    errorInfo.isTimeout = true;
    errorInfo.message = 'Request timed out';
  }
  // Check for server errors (5xx)
  else if (error.isServerError || 
           error.response?.status >= 500 ||
           error.message?.includes('Server error')) {
    errorInfo.type = 'server_error';
    errorInfo.isServerError = true;
    errorInfo.message = 'Server is experiencing technical difficulties';
  }

  return errorInfo;
};

// Handle API errors with appropriate user feedback
export const handleApiError = (error, customMessage = null) => {
  const errorInfo = classifyError(error);
  
  switch (errorInfo.type) {
    case 'server_down':
      ServerStatusManager.showServerDownAlert();
      break;
    case 'network_error':
      ServerStatusManager.showNetworkErrorAlert();
      break;
    case 'timeout':
      Alert.alert(
        'Request Timeout',
        'The request took too long. Please try again.',
        [{ text: 'OK' }]
      );
      break;
    case 'server_error':
      Alert.alert(
        'Server Error',
        'The server is experiencing technical difficulties. Please try again later.',
        [{ text: 'OK' }]
      );
      break;
    default:
      Alert.alert(
        'Error',
        customMessage || errorInfo.message,
        [{ text: 'OK' }]
      );
  }
  
  return errorInfo;
};

export default ServerStatusManager; 