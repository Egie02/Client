import * as LocalAuthentication from 'expo-local-authentication';
import { Platform, Alert } from 'react-native';
import { AUTH_CONFIG, ERROR_MESSAGES } from '../config/security.config';

export class BiometricManager {
  constructor() {
    this.isAvailable = false;
    this.supportedTypes = [];
    this.hasHardware = false;
    this.isEnrolled = false;
    this.retryCount = 0;
  }

  /**
   * Initialize biometric manager and check availability
   */
  async initialize() {
    try {
      this.hasHardware = await LocalAuthentication.hasHardwareAsync();
      this.isEnrolled = await LocalAuthentication.isEnrolledAsync();
      this.supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      this.isAvailable = this.hasHardware && this.isEnrolled && this.supportedTypes.length > 0;
      
      return {
        isAvailable: this.isAvailable,
        hasHardware: this.hasHardware,
        isEnrolled: this.isEnrolled,
        supportedTypes: this.supportedTypes,
        availableTypes: this.getAvailableTypesInfo()
      };
    } catch (error) {
      console.error('BiometricManager initialization error:', error);
      this.isAvailable = false;
      return {
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        availableTypes: [],
        error: error.message
      };
    }
  }

  /**
   * Get detailed information about available biometric types
   */
  getAvailableTypesInfo() {
    const types = [];
    
    this.supportedTypes.forEach(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          types.push({
            type: 'FACE_ID',
            name: Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition',
            icon: 'face-recognition',
            available: true
          });
          break;
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          types.push({
            type: 'FINGERPRINT',
            name: Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint',
            icon: 'fingerprint',
            available: true
          });
          break;
        case LocalAuthentication.AuthenticationType.IRIS:
          types.push({
            type: 'IRIS',
            name: 'Iris Recognition',
            icon: 'eye',
            available: true
          });
          break;
      }
    });

    return types;
  }

  /**
   * Get the primary biometric type (preferred order: Face ID > Touch ID/Fingerprint > Iris)
   */
  getPrimaryBiometricType() {
    const availableTypes = this.getAvailableTypesInfo();
    
    // Prefer Face ID
    const faceId = availableTypes.find(type => type.type === 'FACE_ID');
    if (faceId) return faceId;
    
    // Then Touch ID/Fingerprint
    const fingerprint = availableTypes.find(type => type.type === 'FINGERPRINT');
    if (fingerprint) return fingerprint;
    
    // Finally Iris
    const iris = availableTypes.find(type => type.type === 'IRIS');
    if (iris) return iris;
    
    return null;
  }

  /**
   * Get appropriate prompt message based on available biometric type
   */
  getPromptMessage() {
    const primaryType = this.getPrimaryBiometricType();
    
    if (!primaryType) {
      return AUTH_CONFIG.BIOMETRIC_GENERAL_PROMPT;
    }
    
    switch (primaryType.type) {
      case 'FACE_ID':
        return AUTH_CONFIG.BIOMETRIC_FACE_ID_PROMPT;
      case 'FINGERPRINT':
        return Platform.OS === 'ios' 
          ? AUTH_CONFIG.BIOMETRIC_TOUCH_ID_PROMPT 
          : AUTH_CONFIG.BIOMETRIC_FINGERPRINT_PROMPT;
      default:
        return AUTH_CONFIG.BIOMETRIC_GENERAL_PROMPT;
    }
  }

  /**
   * Authenticate using biometrics with proper fallback
   */
  async authenticate(options = {}) {
    try {
      // Check if biometrics are available
      if (!this.isAvailable) {
        const status = await this.initialize();
        if (!status.isAvailable) {
          return {
            success: false,
            error: this.getBiometricUnavailableReason(status),
            canRetry: false,
            shouldFallbackToPIN: true
          };
        }
      }

      // Prepare authentication options
      const authOptions = {
        promptMessage: options.promptMessage || this.getPromptMessage(),
        fallbackLabel: options.fallbackLabel || AUTH_CONFIG.BIOMETRIC_FALLBACK_LABEL,
        disableDeviceFallback: options.disableDeviceFallback || false,
        requireConfirmation: options.requireConfirmation || false,
        cancelLabel: options.cancelLabel || 'Cancel',
        ...options
      };

      // Attempt authentication
      const result = await LocalAuthentication.authenticateAsync(authOptions);

      if (result.success) {
        this.retryCount = 0; // Reset retry count on success
        return {
          success: true,
          error: null,
          canRetry: false,
          shouldFallbackToPIN: false
        };
      } else {
        return this.handleAuthenticationError(result.error);
      }

    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.BIOMETRIC_ERROR,
        canRetry: this.retryCount < AUTH_CONFIG.BIOMETRIC_MAX_RETRIES,
        shouldFallbackToPIN: true
      };
    }
  }

  /**
   * Handle authentication errors and provide appropriate responses
   */
  handleAuthenticationError(error) {
    this.retryCount++;

    // Handle specific error types
    switch (error) {
      case 'user_cancel':
      case 'system_cancel':
        return {
          success: false,
          error: 'Authentication was cancelled',
          canRetry: true,
          shouldFallbackToPIN: true
        };
      
      case 'user_fallback':
        return {
          success: false,
          error: 'User chose to use fallback authentication',
          canRetry: false,
          shouldFallbackToPIN: true
        };
      
      case 'biometric_not_available':
        return {
          success: false,
          error: ERROR_MESSAGES.BIOMETRIC_NOT_AVAILABLE,
          canRetry: false,
          shouldFallbackToPIN: true
        };
      
      case 'biometric_not_enrolled':
        return {
          success: false,
          error: ERROR_MESSAGES.BIOMETRIC_NOT_ENROLLED,
          canRetry: false,
          shouldFallbackToPIN: true
        };
      
      case 'biometric_lockout':
      case 'biometric_lockout_permanent':
        return {
          success: false,
          error: ERROR_MESSAGES.BIOMETRIC_LOCKOUT_MESSAGE,
          canRetry: false,
          shouldFallbackToPIN: true
        };
      
      default:
        const canRetry = this.retryCount < AUTH_CONFIG.BIOMETRIC_MAX_RETRIES;
        return {
          success: false,
          error: canRetry 
            ? `Authentication failed. ${AUTH_CONFIG.BIOMETRIC_MAX_RETRIES - this.retryCount} attempts remaining.`
            : ERROR_MESSAGES.BIOMETRIC_AUTH_FAILED,
          canRetry: canRetry,
          shouldFallbackToPIN: !canRetry
        };
    }
  }

  /**
   * Get reason why biometric authentication is unavailable
   */
  getBiometricUnavailableReason(status) {
    if (!status.hasHardware) {
      return ERROR_MESSAGES.BIOMETRIC_HARDWARE_NOT_AVAILABLE;
    }
    
    if (!status.isEnrolled) {
      return ERROR_MESSAGES.BIOMETRIC_NOT_ENROLLED;
    }
    
    if (!status.supportedTypes || status.supportedTypes.length === 0) {
      return ERROR_MESSAGES.BIOMETRIC_NOT_AVAILABLE;
    }
    
    return ERROR_MESSAGES.BIOMETRIC_ERROR;
  }

  /**
   * Show biometric setup instructions
   */
  showBiometricSetupInstructions() {
    const primaryType = this.getPrimaryBiometricType();
    const typeName = primaryType ? primaryType.name : 'biometric authentication';
    
    Alert.alert(
      'Set Up Biometric Authentication',
      `To use ${typeName} for quick login, please set it up in your device settings:\n\n` +
      `Settings > ${Platform.OS === 'ios' ? 'Face ID & Passcode' : 'Security & Biometrics'}`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Open Settings', onPress: () => {
          // This would open device settings if possible
          // For now, just show the user where to go
        }}
      ]
    );
  }

  /**
   * Reset retry count
   */
  resetRetryCount() {
    this.retryCount = 0;
  }

  /**
   * Check if specific biometric type is available
   */
  isTypeAvailable(type) {
    const availableTypes = this.getAvailableTypesInfo();
    return availableTypes.some(availableType => availableType.type === type);
  }

  /**
   * Check if Face ID is available
   */
  isFaceIdAvailable() {
    return this.isTypeAvailable('FACE_ID');
  }

  /**
   * Check if Touch ID/Fingerprint is available
   */
  isFingerprintAvailable() {
    return this.isTypeAvailable('FINGERPRINT');
  }
}

// Export singleton instance
export const biometricManager = new BiometricManager();

export default biometricManager; 