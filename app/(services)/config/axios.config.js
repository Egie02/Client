import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEV_API_URL = 'https://cloud.mandaluyongmpc.com';

const API_URL = DEV_API_URL ;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'  // Skip ngrok browser warning
  },
  withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from storage
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        // Error handling remains, but without console.log
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.multiRemove(['userInfo', 'userPhoneNumber', 'userData']);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;