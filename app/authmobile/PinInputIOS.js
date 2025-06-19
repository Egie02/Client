/**
 * PinInputIOS - iOS-specific PIN input component
 * Handles Face ID and Touch ID with iOS-optimized UX patterns
 */

import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler, Alert, Platform, Modal } from 'react-native';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'expo-router';
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { loginUser, saveBiometricCredentials, getBiometricCredentials, clearBiometricCredentials } from '../(services)/api/api';
import { loginAndLoadUser } from "../(redux)/authSlice";
import { pinstyle } from '../components/styles/mobilestyle';
import TutorialModal from '../components/TutorialModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { 
  AUTH_CONFIG, 
  STORAGE_KEYS, 
  SecurityValidators, 
  FirstTimePinSecurity,
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES 
} from '../(services)/config/security.config';
import SecureStorageManager from '../(services)/utils/SecureStorage';
import biometricManager from '../(services)/utils/BiometricManager';

export default function PinInputIOS() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [pin, setPin] = useState(['', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const inputRefs = useRef([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [secureTextIndexes, setSecureTextIndexes] = useState([true, true, true, true]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  // Biometric features disabled for future update
  // const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  // const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  // const [biometricStatus, setBiometricStatus] = useState(null);
  // const [shouldAutoTriggerBiometric, setShouldAutoTriggerBiometric] = useState(false);
  // const [biometricRetryCount, setBiometricRetryCount] = useState(0);
  // const [biometricPreference, setBiometricPreference] = useState('auto');
  // const [lastBiometricError, setLastBiometricError] = useState(null);
  // const [biometricInitialized, setBiometricInitialized] = useState(false);
  // const [showPreferenceModal, setShowPreferenceModal] = useState(false);

  const tutorialSteps = [
    {
      title: 'iOS PIN Login',
      description: 'This is your secure PIN entry screen on iOS. Enter your 4-digit PIN to access your account.'
    },
    // Biometric tutorial steps disabled for future update
    // {
    //   title: 'Face ID & Touch ID',
    //   description: 'On iOS, Face ID or Touch ID will automatically prompt when available for seamless authentication.'
    // },
    // {
    //   title: 'Automatic Authentication',
    //   description: 'iOS provides a seamless experience - biometric authentication will trigger automatically when you have saved credentials.'
    // }
  ];

  const mutation = useMutation({
    mutationFn: loginUser,
    mutationKey: ["login"]
  });

  // Initialize and check access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const phone = await SecureStorageManager.getItem(STORAGE_KEYS.TEMP_PHONE);
        if (!phone) {
          router.replace("/authmobile/Login");
          return;
        }
        setPhoneNumber(phone);
        // await initializeBiometrics(); // Biometric initialization disabled for future update
      } catch (error) {
        router.replace("/authmobile/Login");
      }
    };
    checkAccess();
  }, []);

  // Check first time user and load preferences
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const isFirstTime = await SecureStorageManager.getItem('pin_tutorial_shown_ios');
        if (!isFirstTime) {
          setShowTutorial(true);
          await SecureStorageManager.setItem('pin_tutorial_shown_ios', 'true');
        }
        
        // Biometric preference loading disabled for future update
        // const savedPreference = await SecureStorageManager.getItem('biometric_preference');
        // if (savedPreference) {
        //   setBiometricPreference(savedPreference);
        // }
      } catch (error) {
        // Error handling without console logging
      }
    };
    checkFirstTimeUser();
  }, []);

  // Biometric auto-trigger disabled for future update
  // useEffect(() => {
  //   const checkBiometricAndLogin = async () => {
  //     if (biometricInitialized && isBiometricAvailable && hasSavedCredentials && biometricPreference === 'auto') {
  //       try {
  //         const credentials = await getBiometricCredentials();
  //         if (credentials && credentials.phoneNumber === phoneNumber) {
  //           setShouldAutoTriggerBiometric(true);
  //           setTimeout(() => {
  //             handleBiometricAuthWithRetry();
  //           }, 1000); // Delay for better UX
  //         }
  //       } catch (error) {
  //         setLastBiometricError(error.message);
  //         setShouldAutoTriggerBiometric(false);
  //       }
  //     }
  //   };

  //   if (phoneNumber && biometricPreference !== 'disabled') {
  //     checkBiometricAndLogin();
  //   }
  // }, [biometricInitialized, isBiometricAvailable, hasSavedCredentials, phoneNumber, biometricPreference]);

  // Biometric initialization disabled for future update
  // const initializeBiometrics = async () => {
  //   try {
  //     const status = await biometricManager.initialize();
  //     setBiometricStatus(status);
  //     setIsBiometricAvailable(status.isAvailable);
  //     setBiometricInitialized(true);
  //     
  //     if (status.isAvailable) {
  //       const credentials = await getBiometricCredentials();
  //       setHasSavedCredentials(!!credentials);
  //     }
  //   } catch (error) {
  //     setIsBiometricAvailable(false);
  //     setBiometricInitialized(true);
  //     setLastBiometricError(error.message);
  //   }
  // };

  // Biometric error handling disabled for future update
  // const getBiometricErrorMessage = (error) => {
  //   const errorString = error?.toString() || '';
  //   
  //   if (errorString.includes('User canceled') || errorString.includes('cancelled')) {
  //     return 'Authentication was cancelled. Use your PIN to continue.';
  //   }
  //   if (errorString.includes('Too many attempts') || errorString.includes('lockout')) {
  //     return 'Too many failed attempts. Please use your PIN or try again later.';
  //   }
  //   if (errorString.includes('not available') || errorString.includes('hardware')) {
  //     return 'Biometric authentication is not available on this device.';
  //   }
  //   if (errorString.includes('not enrolled') || errorString.includes('no biometrics')) {
  //     return 'No biometric authentication is set up. Please use your PIN.';
  //   }
  //   if (errorString.includes('system') || errorString.includes('busy')) {
  //     return 'System is busy. Please try again or use your PIN.';
  //   }
  //   if (errorString.includes('permission')) {
  //     return 'Biometric permission denied. Please enable in device settings.';
  //   }
  //   
  //   return 'Biometric authentication failed. Please use your PIN.';
  // };

  // Biometric preference functions disabled for future update
  // const saveBiometricPreference = async (preference) => {
  //   try {
  //     await SecureStorageManager.setItem('biometric_preference', preference);
  //     setBiometricPreference(preference);
  //     
  //     // Clear auto-trigger if disabled
  //     if (preference === 'disabled') {
  //       setShouldAutoTriggerBiometric(false);
  //     }
  //   } catch (error) {
  //     // Error handling without console logging
  //   }
  // };

  // const toggleBiometricPreference = () => {
  //   const newPreference = biometricPreference === 'auto' ? 'disabled' : 'auto';
  //   saveBiometricPreference(newPreference);
  // };

  // Handle PIN login with enhanced first-time PIN detection
  const handleLogin = async (pinString) => {
    const validation = SecurityValidators.validatePin(pinString);
    if (!validation.isValid) {
      Alert.alert('Invalid PIN', validation.error);
      clearPin();
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if this is a default PIN login
      const isDefaultPin = SecurityValidators.isDefaultPin(pinString);
      
      const response = await mutation.mutateAsync({
        PhoneNumber: phoneNumber,
        PIN: pinString
      });

      // If login is successful and user used default PIN, trigger first-time PIN change
      if (isDefaultPin) {
        // Check OTCPIN status to determine if first-time PIN change is required
        const otcpinDisabled = await SecureStorageManager.getItem(STORAGE_KEYS.OTCPIN_DISABLED);
        const hasOtcpinAccess = !otcpinDisabled || otcpinDisabled !== 'true';
        
        if (hasOtcpinAccess) {
          // User has OTCPIN access and is using default PIN - force PIN change
          await FirstTimePinSecurity.triggerFirstTimePinChange(
            phoneNumber, 
            'Default PIN detected on successful login'
          );
          
          // Save user phone for first-time PIN setup
          await SecureStorageManager.setItem(STORAGE_KEYS.USER_PHONE_NUMBER, phoneNumber);
          
          Alert.alert(
            ERROR_MESSAGES.FIRST_TIME_LOGIN_TITLE,
            ERROR_MESSAGES.FIRST_TIME_PIN_REQUIRED,
            [
              {
                text: 'Change PIN Now',
                onPress: () => {
                  router.replace('/authmobile/FirstTimePinSetup');
                }
              }
            ],
            { cancelable: false }
          );
          return;
        }
      }

      // Normal login flow - proceed without biometric saving (disabled for future update)
      // Biometric credential saving disabled for future update
      // await saveBiometricCredentials(phoneNumber, pinString);
      await SecureStorageManager.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, '0');
      await SecureStorageManager.removeItem(STORAGE_KEYS.TEMP_PHONE);
      
      dispatch(loginAndLoadUser(response));
      
      setTimeout(() => {
        router.replace("/(mobile)/MobileDashboard");
      }, AUTH_CONFIG.LOGIN_NAVIGATION_DELAY);
      
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      clearPin();

      if (newAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
        router.replace("/authmobile/Blocked");
      } else {
        Alert.alert('Login Failed', `${err.message}\n\nAttempts remaining: ${AUTH_CONFIG.MAX_LOGIN_ATTEMPTS - newAttempts}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Biometric authentication functions disabled for future update
  // const handleBiometricAuthWithRetry = async (retryCount = 0) => {
  //   const maxRetries = 2;
  //   
  //   try {
  //     setBiometricRetryCount(retryCount);
  //     const credentials = await getBiometricCredentials();
  //     
  //     if (!credentials) {
  //       if (shouldAutoTriggerBiometric) {
  //         setShouldAutoTriggerBiometric(false);
  //         return;
  //       }
  //       Alert.alert('Error', 'No biometric credentials found. Please login with PIN first.');
  //       return;
  //     }

  //     const primaryType = biometricManager.getPrimaryBiometricType();
  //     const isFaceID = primaryType?.type === 'FACE_ID';
  //     const isTouchID = primaryType?.type === 'FINGERPRINT';

  //     let promptMessage = 'Authenticate to access your account';
  //     if (isFaceID) {
  //       promptMessage = retryCount > 0 ? 'Try Face ID again to sign in' : 'Use Face ID to sign in';
  //     } else if (isTouchID) {
  //       promptMessage = retryCount > 0 ? 'Try Touch ID again to sign in' : 'Use Touch ID to sign in';
  //     }

  //     const result = await biometricManager.authenticate({
  //       promptMessage,
  //       fallbackLabel: 'Use Passcode',
  //       disableDeviceFallback: false,
  //       requireConfirmation: false,
  //     });

  //     if (result.success) {
  //       setBiometricRetryCount(0);
  //       setLastBiometricError(null);
  //       setIsLoading(true);
  //       
  //       const response = await loginUser({
  //         PhoneNumber: credentials.phoneNumber,
  //         PIN: credentials.pin
  //       });

  //       dispatch(loginAndLoadUser(response));

  //       
  //       setTimeout(() => {
  //         router.replace("/(mobile)/MobileDashboard");
  //       }, AUTH_CONFIG.LOGIN_NAVIGATION_DELAY);
  //     } else {
  //       // Handle failed authentication
  //       setLastBiometricError(result.error);
  //       
  //       if (retryCount < maxRetries && result.canRetry) {
  //         // Auto-retry with exponential backoff
  //         const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s delays
  //         
  //         setTimeout(() => {
  //           handleBiometricAuthWithRetry(retryCount + 1);
  //         }, delay);
  //       } else {
  //         // Max retries reached or can't retry
  //         setShouldAutoTriggerBiometric(false);
  //         
  //         if (shouldAutoTriggerBiometric) {
  //           Alert.alert(
  //             'Authentication Failed',
  //             getBiometricErrorMessage(result.error),
  //             [
  //               { text: 'Use PIN', onPress: () => setShouldAutoTriggerBiometric(false) },
  //               { 
  //                 text: 'Try Again', 
  //                 onPress: () => {
  //                   setBiometricRetryCount(0);
  //                   handleBiometricAuthWithRetry(0);
  //                 }
  //               },
  //               { text: 'Cancel', style: 'cancel', onPress: () => setShouldAutoTriggerBiometric(false) }
  //             ]
  //           );
  //         } else {
  //           Alert.alert('Authentication Failed', getBiometricErrorMessage(result.error));
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     // Biometric authentication error (console logging removed)
  //     
  //     if (retryCount < maxRetries) {
  //       const delay = (retryCount + 1) * 1500; // Longer delays for errors
  //       setTimeout(() => {
  //         handleBiometricAuthWithRetry(retryCount + 1);
  //       }, delay);
  //     } else {
  //       setShouldAutoTriggerBiometric(false);
  //       
  //       if (shouldAutoTriggerBiometric) {
  //         Alert.alert(
  //           'Biometric Authentication Unavailable',
  //           getBiometricErrorMessage(error),
  //           [{ text: 'Use PIN', onPress: () => setShouldAutoTriggerBiometric(false) }]
  //         );
  //       } else {
  //         Alert.alert('Error', getBiometricErrorMessage(error));
  //       }
  //     }
  //   } finally {
  //     setIsLoading(false);
  //     if (retryCount >= maxRetries) {
  //       setShouldAutoTriggerBiometric(false);
  //     }
  //   }
  // };

  // Manual biometric authentication trigger disabled for future update
  // const handleBiometricAuth = async () => {
  //   if (!isBiometricAvailable) {
  //     Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
  //     return;
  //   }
  //   
  //   if (!hasSavedCredentials) {
  //     Alert.alert('No Credentials', 'Please login with PIN first to enable biometric authentication.');
  //     return;
  //   }
  //   
  //   // Manual trigger - use single attempt without retry
  //   await handleBiometricAuthWithRetry(0);
  // };

  const handlePinChange = (text, index) => {
    if (isLoading || (text && !/^\d$/.test(text))) return;

    const newPin = [...pin];
    const newSecureIndexes = [...secureTextIndexes];
    newPin[index] = text;
    
    if (text) {
      newSecureIndexes[index] = false;
      setSecureTextIndexes(newSecureIndexes);
      
      setTimeout(() => {
        setSecureTextIndexes(prev => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      }, AUTH_CONFIG.PIN_MASK_DELAY);
    }

    setPin(newPin);

    if (text && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    if (newPin.every(digit => digit !== '' && /^\d$/.test(digit))) {
      const pinString = newPin.join('');
      setTimeout(() => handleLogin(pinString), 200);
    }
  };

  const clearPin = () => {
    setPin(['', '', '', '']);
    setSecureTextIndexes([true, true, true, true]);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <View style={styles.iosContainer}>
      <TutorialModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        steps={tutorialSteps}
        storageKey="pin_tutorial_shown_ios"
        onComplete={() => setShowTutorial(false)}
      />
      
      <View style={styles.iosCardContainer}>
        <View style={pinstyle.headerContainer}>
          <Text style={styles.iosHeaderText}>Enter PIN</Text>
          {isLoading && (
            <Text style={styles.iosSubtitleText}>Verifying PIN...</Text>
          )}
        </View>
        
        <View style={styles.iosPhoneContainer}>
          <View style={styles.phoneInfoRow}>
            <TouchableOpacity
              style={styles.changeNumberButton}
              onPress={async () => {
                try {
                  // Biometric credential clearing disabled for future update
                  // await clearBiometricCredentials();
                  
                  // Clear phone data from SecureStorage
                  await SecureStorageManager.removeItem(STORAGE_KEYS.TEMP_PHONE);
                  await SecureStorageManager.removeItem('permanent_phone');
                  
                } catch (error) {
                  // Error handling without console logging
                }
                router.replace("/authmobile/Login");
              }}
            >
              <MaterialCommunityIcons name="phone-remove" size={14} color="#007AFF" />
              <Text style={styles.changeNumberButtonText}>Change</Text>
            </TouchableOpacity>
            <View style={styles.phoneNumberContainer}>
              <Text style={styles.iosPhoneText}>{phoneNumber}</Text>
            </View>
          </View>
        </View>

        {/* Biometric auto authentication UI disabled for future update */}
        {/* {shouldAutoTriggerBiometric && (
          <View style={styles.autoAuthContainer}>
            <MaterialCommunityIcons 
              name={biometricManager.getPrimaryBiometricType()?.icon || 'fingerprint'} 
              size={32} 
              color="#007AFF" 
            />
            <Text style={styles.autoAuthText}>
              Authenticating with {biometricManager.getPrimaryBiometricType()?.name || 'Biometrics'}...
            </Text>
            {biometricRetryCount > 0 && (
              <Text style={styles.retryText}>
                Retry attempt {biometricRetryCount} of 2
              </Text>
            )}
          </View>
        )} */}

        {/* Biometric controls disabled for future update */}
        {/* {isBiometricAvailable && hasSavedCredentials && (
          <View style={styles.biometricWrapper}>
            <View style={styles.biometricControlsRow}>
              {!shouldAutoTriggerBiometric && (
                <TouchableOpacity
                  style={[styles.iosBiometricButton, isLoading && { opacity: 0.5 }]}
                  onPress={handleBiometricAuth}
                  disabled={isLoading}
                >
                  <MaterialCommunityIcons 
                    name={biometricManager.getPrimaryBiometricType()?.icon || "fingerprint"} 
                    size={18} 
                    color="#FFFFFF"
                  />
                  <Text style={styles.biometricButtonText}>
                    Use {biometricManager.getPrimaryBiometricType()?.name || 'Biometrics'}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => setShowPreferenceModal(true)}
              >
                <MaterialCommunityIcons name="cog" size={18} color="#007AFF" />
                <Text style={styles.settingsButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        )} */}

        <View style={pinstyle.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={[
                styles.iosPinInput,
                isLoading && { opacity: 0.5 }
              ]}
              maxLength={1}
              keyboardType="number-pad"
              secureTextEntry={secureTextIndexes[index]}
              showSoftInputOnFocus={false}
              value={digit}
              onChangeText={(text) => handlePinChange(text, index)}
              editable={!isLoading}
            />
          ))}
        </View>

        <View style={pinstyle.keypadContainer}>
          <View style={pinstyle.keypadRow}>
            {[1, 2, 3].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.iosKeypadButton,
                  isLoading && { opacity: 0.5 }
                ]}
                onPress={() => {
                  const currentIndex = pin.findIndex(digit => digit === '');
                  if (currentIndex !== -1) {
                    handlePinChange(num.toString(), currentIndex);
                  }
                }}
                disabled={isLoading}
              >
                <Text style={styles.iosKeypadButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={pinstyle.keypadRow}>
            {[4, 5, 6].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.iosKeypadButton,
                  isLoading && { opacity: 0.5 }
                ]}
                onPress={() => {
                  const currentIndex = pin.findIndex(digit => digit === '');
                  if (currentIndex !== -1) {
                    handlePinChange(num.toString(), currentIndex);
                  }
                }}
                disabled={isLoading}
              >
                <Text style={styles.iosKeypadButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={pinstyle.keypadRow}>
            {[7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.iosKeypadButton,
                  isLoading && { opacity: 0.5 }
                ]}
                onPress={() => {
                  const currentIndex = pin.findIndex(digit => digit === '');
                  if (currentIndex !== -1) {
                    handlePinChange(num.toString(), currentIndex);
                  }
                }}
                disabled={isLoading}
              >
                <Text style={styles.iosKeypadButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={pinstyle.keypadRow}>
            <TouchableOpacity style={[styles.iosKeypadButton, { opacity: 0 }]} disabled />
            <TouchableOpacity
              style={[
                styles.iosKeypadButton,
                isLoading && { opacity: 0.5 }
              ]}
              onPress={() => {
                const currentIndex = pin.findIndex(digit => digit === '');
                if (currentIndex !== -1) {
                  handlePinChange('0', currentIndex);
                }
              }}
              disabled={isLoading}
            >
              <Text style={styles.iosKeypadButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iosKeypadButton,
                isLoading && { opacity: 0.5 }
              ]}
              onPress={() => {
                const lastIndex = pin.map(digit => digit !== '').lastIndexOf(true);
                if (lastIndex !== -1) {
                  const newPin = [...pin];
                  newPin[lastIndex] = '';
                  setPin(newPin);
                }
              }}
              disabled={isLoading}
            >
              <Text style={styles.iosKeypadButtonText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Biometric Preference Modal disabled for future update */}
      {/* <Modal
        visible={showPreferenceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreferenceModal(false)}
        supportedOrientations={['portrait']}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Biometric Settings</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPreferenceModal(false)}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Automatic Biometric Authentication</Text>
              <Text style={styles.toggleDescription}>
                When enabled, {biometricManager.getPrimaryBiometricType()?.name || 'biometric authentication'} will automatically prompt when you enter the PIN screen.
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  biometricPreference === 'auto' && styles.toggleButtonActive
                ]}
                onPress={toggleBiometricPreference}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.toggleSwitch,
                  biometricPreference === 'auto' && styles.toggleSwitchActive
                ]}>
                  <View style={[
                    styles.toggleKnob,
                    biometricPreference === 'auto' && styles.toggleKnobActive
                  ]} />
                </View>
                <Text style={[
                  styles.toggleText,
                  biometricPreference === 'auto' && styles.toggleTextActive
                ]}>
                  {biometricPreference === 'auto' ? 'Enabled' : 'Disabled'}
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.statusText}>
                Status: {biometricPreference === 'auto' ? 'Automatic authentication enabled' : 'Manual authentication only'}
              </Text>
            </View>
          </View>
        </View>
      </Modal> */}
    </View>
  );
}

const styles = StyleSheet.create({
  // iOS-specific container
  iosContainer: {
    flex: 1,
    backgroundColor: '#E0F7FA', // Bluish background like login
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  // iOS-specific card
  iosCardContainer: {
    backgroundColor: '#F0F4C3',
    borderRadius: 20, // More rounded for iOS
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    flex: 1,
    maxHeight: '90%',
    alignSelf: 'center',
    minHeight: 520,
  },
  // iOS header styling
  iosHeaderText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 6,
  },
  iosSubtitleText: {
    fontSize: 14,
    color: '#007AFF', // iOS blue for branding
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  // Biometric controls
  biometricWrapper: {
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  biometricControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  iosBiometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF', // iOS blue
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14, // More rounded for iOS
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    flex: 1,
    minHeight: 36,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    minWidth: 80,
  },
  settingsButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  biometricButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: 0.2,
  },

  // Change number button
  changeNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    backgroundColor: '#F0F8FF', // Light blue background
  },
  changeNumberButtonText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Auto authentication container
  autoAuthContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 4,
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E0F0FF',
    minHeight: 52,
  },
  autoAuthText: {
    fontSize: 13,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  // iOS-specific PIN inputs
  iosPinInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#007AFF', // iOS blue border
    borderRadius: 16, // More rounded for iOS
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    fontWeight: '600',
    color: '#000000',
  },
  // iOS-specific keypad buttons
  iosKeypadButton: {
    backgroundColor: '#007AFF', // iOS blue
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18, // More rounded for iOS
    minHeight: 45,
    maxHeight: 55,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iosKeypadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Compact keypad styles for when auto biometric is active (iOS)
  compactKeypadContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  compactKeypadButton: {
    minHeight: 40,
    maxHeight: 44,
    borderRadius: 16,
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  compactKeypadButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // iOS phone display
  iosPhoneContainer: {
    marginBottom: 20,
    paddingHorizontal: 2,
    paddingRight: 0,
  },
  phoneInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingRight: 0,
    marginRight: 0,
  },
  phoneNumberContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: '#F8FDFF',
    borderWidth: 1.5,
    borderColor: '#B3E5FC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginLeft: 10,
    marginRight: 0,
    minHeight: 36,
  },
  iosPhoneText: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'left',
  },

  retryText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Modal styles - iOS Design System
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS system background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Safe area consideration
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8', // iOS separator color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E', // iOS label color
    letterSpacing: -0.4,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  toggleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E5E5E7',
  },
  toggleLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  toggleDescription: {
    fontSize: 16,
    color: '#8E8E93', // iOS secondary label
    lineHeight: 22,
    marginBottom: 24,
    letterSpacing: -0.1,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#E8F4FF', // Light blue tint
    borderColor: '#007AFF',
    shadowOpacity: 0.1,
  },
  toggleSwitch: {
    width: 52,
    height: 32,
    backgroundColor: '#E9E9EA', // iOS switch off color
    borderRadius: 16,
    marginRight: 16,
    justifyContent: 'center',
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#34C759', // iOS green (success color)
  },
  toggleKnob: {
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: '#D1D1D6',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  toggleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.2,
  },
  toggleTextActive: {
    color: '#007AFF',
  },
  statusText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: -0.1,
    marginTop: 4,
  },
}); 