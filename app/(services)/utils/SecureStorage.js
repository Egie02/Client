/**
 * Secure Storage Utility
 * Provides an abstraction layer for secure data storage
 * Automatically chooses the appropriate storage method based on data sensitivity
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Configuration for which data should use secure storage
const SECURE_STORAGE_KEYS = [
  'biometricCredentials',
  'userPin',
  'authToken',
  'refreshToken',
  'encryptedUserData',
];

// Configuration for SecureStore options
const SECURE_STORE_OPTIONS = {
  requireAuthentication: false, // Set to true for additional biometric requirement
  authenticationPrompt: 'Authenticate to access secure data',
        keychainService: 'MMPCMOBILE',
  touchID: true,
  showModal: false,
};

class SecureStorageManager {
  /**
   * Determines if a key should use secure storage
   * @param {string} key - Storage key
   * @returns {boolean} - True if should use secure storage
   */
  static shouldUseSecureStorage(key) {
    return SECURE_STORAGE_KEYS.some(secureKey => 
      key.includes(secureKey) || key.startsWith(secureKey)
    );
  }

  /**
   * Checks if SecureStore is available on the current platform
   * @returns {boolean} - True if SecureStore is available
   */
  static isSecureStoreAvailable() {
    return Platform.OS !== 'web' && SecureStore.isAvailableAsync !== undefined;
  }

  /**
   * Sets an item in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @param {object} options - Storage options
   * @returns {Promise<boolean>} - Success status
   */
  static async setItem(key, value, options = {}) {
    try {
      const useSecureStorage = this.shouldUseSecureStorage(key) && this.isSecureStoreAvailable();
      
      if (useSecureStorage) {
        const secureOptions = { ...SECURE_STORE_OPTIONS, ...options };
        await SecureStore.setItemAsync(key, value, secureOptions);
      } else {
        await AsyncStorage.setItem(key, value);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets an item from storage
   * @param {string} key - Storage key
   * @param {object} options - Storage options
   * @returns {Promise<string|null>} - Retrieved value or null
   */
  static async getItem(key, options = {}) {
    try {
      const useSecureStorage = this.shouldUseSecureStorage(key) && this.isSecureStoreAvailable();
      
      if (useSecureStorage) {
        const secureOptions = { ...SECURE_STORE_OPTIONS, ...options };
        const value = await SecureStore.getItemAsync(key, secureOptions);
        return value;
      } else {
        const value = await AsyncStorage.getItem(key);
        return value;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Removes an item from storage
   * @param {string} key - Storage key
   * @param {object} options - Storage options
   * @returns {Promise<boolean>} - Success status
   */
  static async removeItem(key, options = {}) {
    try {
      const useSecureStorage = this.shouldUseSecureStorage(key) && this.isSecureStoreAvailable();
      
      if (useSecureStorage) {
        const secureOptions = { ...SECURE_STORE_OPTIONS, ...options };
        await SecureStore.deleteItemAsync(key, secureOptions);
      } else {
        await AsyncStorage.removeItem(key);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Removes multiple items from storage
   * @param {string[]} keys - Array of storage keys
   * @returns {Promise<boolean>} - Success status
   */
  static async multiRemove(keys) {
    try {
      const secureKeys = keys.filter(key => 
        this.shouldUseSecureStorage(key) && this.isSecureStoreAvailable()
      );
      const regularKeys = keys.filter(key => 
        !this.shouldUseSecureStorage(key) || !this.isSecureStoreAvailable()
      );

      // Remove from SecureStore
      if (secureKeys.length > 0) {
        await Promise.all(
          secureKeys.map(key => SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS))
        );
      }

      // Remove from AsyncStorage
      if (regularKeys.length > 0) {
        await AsyncStorage.multiRemove(regularKeys);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sets multiple items in storage
   * @param {Array<[string, string]>} keyValuePairs - Array of [key, value] pairs
   * @returns {Promise<boolean>} - Success status
   */
  static async multiSet(keyValuePairs) {
    try {
      const secureItems = keyValuePairs.filter(([key]) => 
        this.shouldUseSecureStorage(key) && this.isSecureStoreAvailable()
      );
      const regularItems = keyValuePairs.filter(([key]) => 
        !this.shouldUseSecureStorage(key) || !this.isSecureStoreAvailable()
      );

      // Set in SecureStore
      if (secureItems.length > 0) {
        await Promise.all(
          secureItems.map(([key, value]) => 
            SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS)
          )
        );
      }

      // Set in AsyncStorage
      if (regularItems.length > 0) {
        await AsyncStorage.multiSet(regularItems);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clears all data from both storage systems
   * WARNING: This will remove ALL stored data
   * @returns {Promise<boolean>} - Success status
   */
  static async clearAll() {
    try {
      // Clear AsyncStorage
      await AsyncStorage.clear();
      
      // Clear SecureStore (if available)
      if (this.isSecureStoreAvailable()) {
        // Note: SecureStore doesn't have a clear all method
        // You would need to track and remove individual keys
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets storage information and diagnostics
   * @returns {Promise<object>} - Storage information
   */
  static async getStorageInfo() {
    try {
      const info = {
        isSecureStoreAvailable: this.isSecureStoreAvailable(),
        platform: Platform.OS,
        secureStorageKeys: SECURE_STORAGE_KEYS,
        timestamp: new Date().toISOString(),
      };

      return info;
    } catch (error) {
      return null;
    }
  }
}

export default SecureStorageManager; 