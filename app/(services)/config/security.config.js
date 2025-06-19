// Authentication Constants
export const AUTH_CONFIG = {
  // Default PIN for first-time setup
  DEFAULT_PIN: '1234',
  
  // PIN validation
  PIN_LENGTH: 4,
  PIN_REGEX: /^\d{4}$/,
  
  // Login attempt limits
  MAX_LOGIN_ATTEMPTS: 3,
  
  // Session management
  SESSION_TIMEOUT_MINUTES: 15,
  SESSION_WARNING_MINUTES: 2,
  
  // Biometric authentication
  BIOMETRIC_PROMPT_MESSAGE: 'Authenticate to login',
  BIOMETRIC_FALLBACK_LABEL: 'Use PIN',
  BIOMETRIC_FACE_ID_PROMPT: 'Use Face ID to login',
  BIOMETRIC_TOUCH_ID_PROMPT: 'Use Touch ID to login',
  BIOMETRIC_FINGERPRINT_PROMPT: 'Use fingerprint to login',
  BIOMETRIC_GENERAL_PROMPT: 'Use biometric authentication to login',
  
  // PIN masking delay (in milliseconds)
  PIN_MASK_DELAY: 100,
  
  // Navigation delay after login (in milliseconds)
  LOGIN_NAVIGATION_DELAY: 150,
  
  // Biometric retry attempts
  BIOMETRIC_MAX_RETRIES: 3,
  BIOMETRIC_RETRY_DELAY: 1000, // milliseconds
  
  // First-time PIN security
  FIRST_TIME_PIN_MAX_ATTEMPTS: 3,
  FIRST_TIME_PIN_LOCKOUT_DURATION: 300000, // 5 minutes in milliseconds
};

// Storage Keys - Centralized to avoid typos and ensure consistency
export const STORAGE_KEYS = {
  // User data
  USER_INFO: 'userInfo',
  USER_DATA: 'userData',
  USER_PHONE_NUMBER: 'userPhoneNumber',
  
  // Authentication
  TEMP_PHONE: 'tempPhone',
  PERMANENT_PHONE: 'permanentPhone',
  FAILED_ATTEMPTS: 'failedAttempts',
  OTCPIN_DISABLED: 'OTCPIN_DISABLED',
  
  // First-time PIN security
  FIRST_TIME_PIN_REQUIRED: 'firstTimePinRequired',
  FIRST_TIME_PIN_ATTEMPTS: 'firstTimePinAttempts',
  FIRST_TIME_PIN_LOCKOUT: 'firstTimePinLockout',
  FIRST_TIME_PIN_COMPLETED: 'firstTimePinCompleted',
  
  // Tutorial and first-time user
  IS_FIRST_TIME_USER: 'isFirstTimeUser',
  IS_FIRST_TIME_LOGIN: 'isFirstTimeLogin',
  LOGIN_TUTORIAL_SHOWN: 'login_tutorial_shown',
  PIN_TUTORIAL_SHOWN: 'pin_tutorial_shown',
  DASHBOARD_TUTORIAL_SHOWN: 'dashboard_tutorial_shown',
  SETTINGS_TUTORIAL_SHOWN: 'settings_tutorial_shown',
  QUICKTERM_TUTORIAL_SHOWN: 'quickterm_tutorial_shown',
  
  // Profile customization
  PROFILE_IMAGE: 'profileImage',
};

// Security validation functions
export const SecurityValidators = {
  /**
   * Validates if a PIN is the default PIN
   * @param {string} pin - The PIN to validate
   * @returns {boolean} - True if it's the default PIN
   */
  isDefaultPin: (pin) => {
    return pin === AUTH_CONFIG.DEFAULT_PIN;
  },
  
  /**
   * Validates PIN format
   * @param {string} pin - The PIN to validate
   * @returns {boolean} - True if PIN format is valid
   */
  isValidPinFormat: (pin) => {
    return AUTH_CONFIG.PIN_REGEX.test(pin);
  },
  
  /**
   * Validates PIN length
   * @param {string} pin - The PIN to validate
   * @returns {boolean} - True if PIN length is valid
   */
  isValidPinLength: (pin) => {
    return pin && pin.length === AUTH_CONFIG.PIN_LENGTH;
  },
  
  /**
   * Comprehensive PIN validation
   * @param {string} pin - The PIN to validate
   * @returns {object} - Validation result with isValid and error message
   */
  validatePin: (pin) => {
    if (!pin) {
      return { isValid: false, error: 'PIN is required' };
    }
    
    if (!SecurityValidators.isValidPinLength(pin)) {
      return { isValid: false, error: `PIN must be exactly ${AUTH_CONFIG.PIN_LENGTH} digits` };
    }
    
    if (!SecurityValidators.isValidPinFormat(pin)) {
      return { isValid: false, error: 'PIN must contain only numbers' };
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validates phone number format
   * @param {string} phoneNumber - The phone number to validate
   * @returns {boolean} - True if phone number format is valid
   */
  isValidPhoneFormat: (phoneNumber) => {
    // Accepts both 10-digit and 12-digit (with 63 prefix) formats
    return /^(63)?[0-9]{10}$/.test(phoneNumber);
  },
  
  /**
   * Enhanced first-time PIN validation
   * @param {string} newPin - The new PIN to validate
   * @param {string} confirmPin - The confirmation PIN
   * @returns {object} - Validation result with isValid and error message
   */
  validateFirstTimePin: (newPin, confirmPin) => {
    // Basic PIN validation
    const newPinValidation = SecurityValidators.validatePin(newPin);
    if (!newPinValidation.isValid) {
      return newPinValidation;
    }
    
    const confirmPinValidation = SecurityValidators.validatePin(confirmPin);
    if (!confirmPinValidation.isValid) {
      return { isValid: false, error: `Confirmation ${confirmPinValidation.error.toLowerCase()}` };
    }
    
    // Check if PINs match
    if (newPin !== confirmPin) {
      return { isValid: false, error: ERROR_MESSAGES.PIN_MISMATCH };
    }
    
    // Check if new PIN is the same as default PIN
    if (SecurityValidators.isDefaultPin(newPin)) {
      return { isValid: false, error: ERROR_MESSAGES.PIN_SAME_AS_DEFAULT };
    }
    
    // Check for weak PINs (all same digits, sequential numbers)
    if (/^(\d)\1{3}$/.test(newPin)) {
      return { isValid: false, error: 'PIN cannot be all the same digits (e.g., 1111)' };
    }
    
    if (['0123', '1234', '2345', '3456', '4567', '5678', '6789', '9876', '8765', '7654', '6543', '5432', '4321', '3210'].includes(newPin)) {
      return { isValid: false, error: 'PIN cannot be a sequential pattern' };
    }
    
    return { isValid: true, error: null };
  },
};

// First-time PIN security functions
export const FirstTimePinSecurity = {
  /**
   * Triggers first-time PIN change requirement
   * @param {string} phoneNumber - User's phone number
   * @param {string} reason - Reason for triggering (for logging)
   */
  triggerFirstTimePinChange: async (phoneNumber, reason = 'Default PIN detected') => {
    try {
      const SecureStorageManager = (await import('../utils/SecureStorage')).default;
      
      // Set the first-time PIN required flag
      await SecureStorageManager.setItem(STORAGE_KEYS.FIRST_TIME_PIN_REQUIRED, 'true');
      await SecureStorageManager.setItem(`${STORAGE_KEYS.FIRST_TIME_PIN_REQUIRED}_${phoneNumber}`, Date.now().toString());
      await SecureStorageManager.setItem(STORAGE_KEYS.FIRST_TIME_PIN_ATTEMPTS, '0');
      
      // Log the trigger reason securely (without sensitive data)
      await SecureStorageManager.setItem('firstTimePinTriggerReason', reason);
      
      return true;
    } catch (error) {
      throw new Error('Failed to trigger first-time PIN change');
    }
  },
  
  /**
   * Checks if first-time PIN change is required
   * @param {string} phoneNumber - User's phone number
   * @returns {boolean} - True if first-time PIN change is required
   */
  isFirstTimePinRequired: async (phoneNumber) => {
    try {
      const SecureStorageManager = (await import('../utils/SecureStorage')).default;
      
      const globalFlag = await SecureStorageManager.getItem(STORAGE_KEYS.FIRST_TIME_PIN_REQUIRED);
      const userSpecificFlag = await SecureStorageManager.getItem(`${STORAGE_KEYS.FIRST_TIME_PIN_REQUIRED}_${phoneNumber}`);
      const completed = await SecureStorageManager.getItem(`${STORAGE_KEYS.FIRST_TIME_PIN_COMPLETED}_${phoneNumber}`);
      
      return (globalFlag === 'true' || userSpecificFlag) && !completed;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Marks first-time PIN change as completed
   * @param {string} phoneNumber - User's phone number
   */
  markFirstTimePinCompleted: async (phoneNumber) => {
    try {
      const SecureStorageManager = (await import('../utils/SecureStorage')).default;
      
      await SecureStorageManager.setItem(`${STORAGE_KEYS.FIRST_TIME_PIN_COMPLETED}_${phoneNumber}`, Date.now().toString());
      await SecureStorageManager.removeItem(STORAGE_KEYS.FIRST_TIME_PIN_REQUIRED);
      await SecureStorageManager.removeItem(`${STORAGE_KEYS.FIRST_TIME_PIN_REQUIRED}_${phoneNumber}`);
      await SecureStorageManager.removeItem(STORAGE_KEYS.FIRST_TIME_PIN_ATTEMPTS);
      await SecureStorageManager.removeItem(STORAGE_KEYS.FIRST_TIME_PIN_LOCKOUT);
      
      return true;
    } catch (error) {
      throw new Error('Failed to mark first-time PIN as completed');
    }
  },
  
  /**
   * Increments failed first-time PIN attempts
   * @returns {number} - Current attempt count
   */
  incrementFirstTimePinAttempts: async () => {
    try {
      const SecureStorageManager = (await import('../utils/SecureStorage')).default;
      
      const currentAttempts = parseInt(await SecureStorageManager.getItem(STORAGE_KEYS.FIRST_TIME_PIN_ATTEMPTS) || '0');
      const newAttempts = currentAttempts + 1;
      
      await SecureStorageManager.setItem(STORAGE_KEYS.FIRST_TIME_PIN_ATTEMPTS, newAttempts.toString());
      
      // If max attempts reached, set lockout
      if (newAttempts >= AUTH_CONFIG.FIRST_TIME_PIN_MAX_ATTEMPTS) {
        const lockoutUntil = Date.now() + AUTH_CONFIG.FIRST_TIME_PIN_LOCKOUT_DURATION;
        await SecureStorageManager.setItem(STORAGE_KEYS.FIRST_TIME_PIN_LOCKOUT, lockoutUntil.toString());
      }
      
      return newAttempts;
    } catch (error) {
      return 0;
    }
  },
  
  /**
   * Checks if user is in first-time PIN lockout
   * @returns {object} - Lockout status and remaining time
   */
  checkFirstTimePinLockout: async () => {
    try {
      const SecureStorageManager = (await import('../utils/SecureStorage')).default;
      
      const lockoutUntil = await SecureStorageManager.getItem(STORAGE_KEYS.FIRST_TIME_PIN_LOCKOUT);
      
      if (!lockoutUntil) {
        return { isLocked: false, remainingTime: 0 };
      }
      
      const lockoutTime = parseInt(lockoutUntil);
      const currentTime = Date.now();
      
      if (currentTime < lockoutTime) {
        return {
          isLocked: true,
          remainingTime: lockoutTime - currentTime
        };
      } else {
        // Lockout expired, clear it
        await SecureStorageManager.removeItem(STORAGE_KEYS.FIRST_TIME_PIN_LOCKOUT);
        await SecureStorageManager.setItem(STORAGE_KEYS.FIRST_TIME_PIN_ATTEMPTS, '0');
        return { isLocked: false, remainingTime: 0 };
      }
    } catch (error) {
      return { isLocked: false, remainingTime: 0 };
    }
  },
  
  /**
   * Resets first-time PIN attempts
   */
  resetFirstTimePinAttempts: async () => {
    try {
      const SecureStorageManager = (await import('../utils/SecureStorage')).default;
      
      await SecureStorageManager.setItem(STORAGE_KEYS.FIRST_TIME_PIN_ATTEMPTS, '0');
      await SecureStorageManager.removeItem(STORAGE_KEYS.FIRST_TIME_PIN_LOCKOUT);
      
      return true;
    } catch (error) {
      return false;
    }
  },
};

// Error messages
export const ERROR_MESSAGES = {
  // PIN related
  PIN_REQUIRED: 'Please enter a complete 4-digit PIN',
  PIN_INVALID_FORMAT: 'PIN must contain only numbers',
  PIN_MISMATCH: 'PINs do not match',
  PIN_SAME_AS_DEFAULT: `New PIN cannot be the default PIN (${AUTH_CONFIG.DEFAULT_PIN}). Please choose a different PIN.`,
  
  // First-time PIN specific
  FIRST_TIME_PIN_LOCKOUT: 'Too many failed attempts. Please wait before trying again.',
  FIRST_TIME_PIN_REQUIRED: 'For security reasons, you must change your default PIN before continuing.',
  
  // Authentication
  PHONE_REQUIRED: 'Phone number not found. Please go back and enter your phone number.',
  LOGIN_FAILED: 'Login Failed',
  ACCOUNT_BLOCKED: 'Account Blocked',
  ACCOUNT_BLOCKED_MESSAGE: 'Too many failed attempts. Your account has been temporarily blocked for security reasons.',
  
  // Biometric
  NO_SAVED_CREDENTIALS: 'No Saved Credentials',
  BIOMETRIC_AUTH_FAILED: 'Authentication Failed',
  BIOMETRIC_ERROR: 'Authentication Error',
  BIOMETRIC_NOT_AVAILABLE: 'Biometric Authentication Not Available',
  BIOMETRIC_NOT_ENROLLED: 'No Biometric Authentication Set Up',
  BIOMETRIC_HARDWARE_NOT_AVAILABLE: 'Biometric Hardware Not Available',
  FACE_ID_NOT_AVAILABLE: 'Face ID Not Available',
  TOUCH_ID_NOT_AVAILABLE: 'Touch ID Not Available',
  FINGERPRINT_NOT_AVAILABLE: 'Fingerprint Not Available',
  BIOMETRIC_LOCKOUT: 'Biometric Authentication Locked',
  BIOMETRIC_LOCKOUT_MESSAGE: 'Too many failed biometric attempts. Please wait or use your PIN to login.',
  
  // First time login
  FIRST_TIME_LOGIN_TITLE: 'First Time Login',
  FIRST_TIME_LOGIN_MESSAGE: 'For security reasons, you must change your default PIN before continuing.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  PIN_CHANGED: 'Your PIN has been set successfully! You can now use your new PIN to login.',
  LOGIN_SUCCESS: 'Login successful',
  FIRST_TIME_PIN_SETUP_COMPLETE: 'Your secure PIN has been set up successfully!',
};

export default {
  AUTH_CONFIG,
  STORAGE_KEYS,
  SecurityValidators,
  FirstTimePinSecurity,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
}; 