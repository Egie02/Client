/**
 * First-Time PIN Trigger Utility
 * Provides secure methods to trigger first-time PIN changes in various scenarios
 */

import { Alert } from 'react-native';
import { 
  AUTH_CONFIG, 
  STORAGE_KEYS, 
  SecurityValidators, 
  FirstTimePinSecurity,
  ERROR_MESSAGES 
} from '../config/security.config';
import SecureStorageManager from './SecureStorage';

/**
 * Triggers first-time PIN change for new user accounts
 * @param {string} phoneNumber - User's phone number
 * @param {object} router - Navigation router instance
 * @param {string} platform - 'mobile' or 'web'
 * @returns {boolean} - Success status
 */
export const triggerNewUserPinChange = async (phoneNumber, router, platform = 'mobile') => {
  try {
    await FirstTimePinSecurity.triggerFirstTimePinChange(
      phoneNumber, 
      'New user account created - mandatory PIN change'
    );
    
    // Save user phone for PIN setup
    await SecureStorageManager.setItem(STORAGE_KEYS.USER_PHONE_NUMBER, phoneNumber);
    
    Alert.alert(
      'Security Setup Required',
      'For your security, please set up a secure PIN to protect your account.',
      [
        {
          text: 'Set Up PIN',
          onPress: () => {
            const route = platform === 'web' ? '/authweb/FirstTimePinSetup' : '/authmobile/FirstTimePinSetup';
            router.replace(route);
          }
        }
      ],
      { cancelable: false }
    );
    
    return true;
  } catch (error) {
    console.error('Failed to trigger new user PIN change:', error);
    return false;
  }
};

/**
 * Triggers first-time PIN change when default PIN is detected
 * @param {string} phoneNumber - User's phone number
 * @param {object} router - Navigation router instance
 * @param {string} platform - 'mobile' or 'web'
 * @returns {boolean} - Success status
 */
export const triggerDefaultPinChange = async (phoneNumber, router, platform = 'mobile') => {
  try {
    // Check if user has OTCPIN access
    const otcpinDisabled = await SecureStorageManager.getItem(STORAGE_KEYS.OTCPIN_DISABLED);
    const hasOtcpinAccess = !otcpinDisabled || otcpinDisabled !== 'true';
    
    if (!hasOtcpinAccess) {
      // User doesn't have OTCPIN access, don't force PIN change
      return false;
    }
    
    await FirstTimePinSecurity.triggerFirstTimePinChange(
      phoneNumber, 
      'Default PIN detected - security enhancement required'
    );
    
    // Save user phone for PIN setup
    await SecureStorageManager.setItem(STORAGE_KEYS.USER_PHONE_NUMBER, phoneNumber);
    
    Alert.alert(
      ERROR_MESSAGES.FIRST_TIME_LOGIN_TITLE,
      ERROR_MESSAGES.FIRST_TIME_PIN_REQUIRED,
      [
        {
          text: 'Change PIN Now',
          onPress: () => {
            const route = platform === 'web' ? '/authweb/FirstTimePinSetup' : '/authmobile/FirstTimePinSetup';
            router.replace(route);
          }
        }
      ],
      { cancelable: false }
    );
    
    return true;
  } catch (error) {
    console.error('Failed to trigger default PIN change:', error);
    return false;
  }
};

/**
 * Triggers first-time PIN change for administrative enforcement
 * @param {string} phoneNumber - User's phone number
 * @param {object} router - Navigation router instance
 * @param {string} platform - 'mobile' or 'web'
 * @param {string} reason - Administrative reason for PIN change
 * @returns {boolean} - Success status
 */
export const triggerAdminPinChange = async (phoneNumber, router, platform = 'mobile', reason = 'Administrative security policy') => {
  try {
    await FirstTimePinSecurity.triggerFirstTimePinChange(phoneNumber, reason);
    
    // Save user phone for PIN setup
    await SecureStorageManager.setItem(STORAGE_KEYS.USER_PHONE_NUMBER, phoneNumber);
    
    Alert.alert(
      'Security Policy Update',
      'Your organization requires you to update your PIN for enhanced security.',
      [
        {
          text: 'Update PIN',
          onPress: () => {
            const route = platform === 'web' ? '/authweb/FirstTimePinSetup' : '/authmobile/FirstTimePinSetup';
            router.replace(route);
          }
        }
      ],
      { cancelable: false }
    );
    
    return true;
  } catch (error) {
    console.error('Failed to trigger admin PIN change:', error);
    return false;
  }
};

/**
 * Triggers first-time PIN change for security breach response
 * @param {string} phoneNumber - User's phone number
 * @param {object} router - Navigation router instance
 * @param {string} platform - 'mobile' or 'web'
 * @returns {boolean} - Success status
 */
export const triggerSecurityBreachPinChange = async (phoneNumber, router, platform = 'mobile') => {
  try {
    await FirstTimePinSecurity.triggerFirstTimePinChange(
      phoneNumber, 
      'Security breach response - mandatory PIN change'
    );
    
    // Save user phone for PIN setup
    await SecureStorageManager.setItem(STORAGE_KEYS.USER_PHONE_NUMBER, phoneNumber);
    
    Alert.alert(
      'Security Alert',
      'For your protection, you must update your PIN immediately due to a security update.',
      [
        {
          text: 'Update Now',
          onPress: () => {
            const route = platform === 'web' ? '/authweb/FirstTimePinSetup' : '/authmobile/FirstTimePinSetup';
            router.replace(route);
          }
        }
      ],
      { cancelable: false }
    );
    
    return true;
  } catch (error) {
    console.error('Failed to trigger security breach PIN change:', error);
    return false;
  }
};

/**
 * Checks if first-time PIN change is required and redirects if necessary
 * @param {string} phoneNumber - User's phone number
 * @param {object} router - Navigation router instance
 * @param {string} platform - 'mobile' or 'web'
 * @returns {boolean} - True if redirect occurred, false if no action needed
 */
export const checkAndRedirectFirstTimePin = async (phoneNumber, router, platform = 'mobile') => {
  try {
    const isRequired = await FirstTimePinSecurity.isFirstTimePinRequired(phoneNumber);
    
    if (isRequired) {
      // Check for lockout
      const lockout = await FirstTimePinSecurity.checkFirstTimePinLockout();
      
      if (lockout.isLocked) {
        const minutes = Math.ceil(lockout.remainingTime / 60000);
        Alert.alert(
          'Temporarily Locked',
          `PIN setup is temporarily locked. Please wait ${minutes} minute(s) before trying again.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Redirect to login
                const loginRoute = platform === 'web' ? '/authweb/Login' : '/authmobile/Login';
                router.replace(loginRoute);
              }
            }
          ]
        );
        return true;
      }
      
      // Redirect to first-time PIN setup
      const route = platform === 'web' ? '/authweb/FirstTimePinSetup' : '/authmobile/FirstTimePinSetup';
      router.replace(route);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to check first-time PIN requirement:', error);
    return false;
  }
};

/**
 * Manual trigger for first-time PIN change (programmatic use)
 * @param {string} phoneNumber - User's phone number
 * @param {object} options - Configuration options
 * @returns {object} - Result with success status and navigation info
 */
export const manualTriggerFirstTimePin = async (phoneNumber, options = {}) => {
  const {
    reason = 'Manual trigger - security enhancement',
    requireImmediate = true,
    customMessage = null
  } = options;
  
  try {
    await FirstTimePinSecurity.triggerFirstTimePinChange(phoneNumber, reason);
    
    // Save user phone for PIN setup
    await SecureStorageManager.setItem(STORAGE_KEYS.USER_PHONE_NUMBER, phoneNumber);
    
    const result = {
      success: true,
      phoneNumber,
      reason,
      timestamp: Date.now(),
      requireImmediate,
      mobileRoute: '/authmobile/FirstTimePinSetup',
      webRoute: '/authweb/FirstTimePinSetup'
    };
    
    if (requireImmediate && customMessage) {
      // Show custom alert if immediate action is required
      return new Promise((resolve) => {
        Alert.alert(
          'PIN Update Required',
          customMessage,
          [
            {
              text: 'Update PIN',
              onPress: () => resolve(result)
            }
          ],
          { cancelable: false }
        );
      });
    }
    
    return result;
  } catch (error) {
    console.error('Failed to manually trigger first-time PIN change:', error);
    return {
      success: false,
      error: error.message,
      phoneNumber,
      timestamp: Date.now()
    };
  }
};

/**
 * Validates if a user qualifies for first-time PIN change
 * @param {string} phoneNumber - User's phone number
 * @param {string} currentPin - Current PIN being used
 * @returns {object} - Validation result
 */
export const validateFirstTimePinQualification = async (phoneNumber, currentPin) => {
  try {
    const isDefaultPin = SecurityValidators.isDefaultPin(currentPin);
    const hasOtcpinAccess = await checkOtcpinAccess();
    const alreadyCompleted = await SecureStorageManager.getItem(`${STORAGE_KEYS.FIRST_TIME_PIN_COMPLETED}_${phoneNumber}`);
    
    return {
      qualifies: isDefaultPin && hasOtcpinAccess && !alreadyCompleted,
      isDefaultPin,
      hasOtcpinAccess,
      alreadyCompleted: !!alreadyCompleted,
      recommendation: getRecommendation(isDefaultPin, hasOtcpinAccess, alreadyCompleted)
    };
  } catch (error) {
    return {
      qualifies: false,
      error: error.message
    };
  }
};

/**
 * Helper function to check OTCPIN access
 * @returns {boolean} - True if user has OTCPIN access
 */
const checkOtcpinAccess = async () => {
  try {
    const otcpinDisabled = await SecureStorageManager.getItem(STORAGE_KEYS.OTCPIN_DISABLED);
    return !otcpinDisabled || otcpinDisabled !== 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Helper function to get recommendation based on qualification factors
 * @param {boolean} isDefaultPin - Whether user is using default PIN
 * @param {boolean} hasOtcpinAccess - Whether user has OTCPIN access
 * @param {boolean} alreadyCompleted - Whether first-time PIN change was already completed
 * @returns {string} - Recommendation message
 */
const getRecommendation = (isDefaultPin, hasOtcpinAccess, alreadyCompleted) => {
  if (alreadyCompleted) {
    return 'First-time PIN change already completed';
  }
  
  if (!hasOtcpinAccess) {
    return 'User does not have OTCPIN access - PIN change not required';
  }
  
  if (isDefaultPin) {
    return 'User is using default PIN and has OTCPIN access - PIN change recommended';
  }
  
  return 'User is using custom PIN - no immediate action required';
};

export default {
  triggerNewUserPinChange,
  triggerDefaultPinChange,
  triggerAdminPinChange,
  triggerSecurityBreachPinChange,
  checkAndRedirectFirstTimePin,
  manualTriggerFirstTimePin,
  validateFirstTimePinQualification
}; 