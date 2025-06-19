import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler, Alert, Modal } from 'react-native';
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

export default function PinInputAndroid() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [pin, setPin] = useState(['', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const inputRefs = useRef([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [secureTextIndexes, setSecureTextIndexes] = useState([true, true, true, true]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState(null);
  const [biometricRetryCount, setBiometricRetryCount] = useState(0);
  const [biometricPreference, setBiometricPreference] = useState('manual');
  const [lastBiometricError, setLastBiometricError] = useState(null);
  const [biometricInitialized, setBiometricInitialized] = useState(false);
  const [shouldAutoTriggerBiometric, setShouldAutoTriggerBiometric] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);

  const tutorialSteps = [
    {
      title: 'Android PIN Login',
      description: 'This is your secure PIN entry screen on Android. Enter your 4-digit PIN to access your account.'
    },
    {
      title: 'Android Biometric Options',
      description: 'On Android, you can use fingerprint or face unlock after entering your PIN once. Tap the biometric button when available.'
    },
    {
      title: 'Manual Biometric Control',
      description: 'Android gives you control - choose when to use biometric authentication with the dedicated button.'
    }
  ];

  const mutation = useMutation({
    mutationFn: loginUser,
    mutationKey: ["login"]
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const phone = await SecureStorageManager.getItem(STORAGE_KEYS.TEMP_PHONE);
        if (!phone) {
          router.replace("/authmobile/Login");
          return;
        }
        setPhoneNumber(phone);
        await initializeBiometrics();
      } catch (error) {
        console.error('Access check failed:', error);
        router.replace("/authmobile/Login");
      }
    };
    checkAccess();
  }, []);

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const isFirstTime = await SecureStorageManager.getItem('pin_tutorial_shown_android');
        if (!isFirstTime) {
          setShowTutorial(true);
          await SecureStorageManager.setItem('pin_tutorial_shown_android', 'true');
        }
        
        const savedPreference = await SecureStorageManager.getItem('biometric_preference');
        if (savedPreference) {
          setBiometricPreference(savedPreference);
        }
      } catch (error) {
        console.warn('Error checking first time user:', error);
      }
    };
    checkFirstTimeUser();
  }, []);

  useEffect(() => {
    const checkBiometricAndLogin = async () => {
      if (biometricInitialized && isBiometricAvailable && hasSavedCredentials && biometricPreference === 'auto') {
        try {
          const credentials = await getBiometricCredentials();
          if (credentials && credentials.phoneNumber === phoneNumber) {
            setShouldAutoTriggerBiometric(true);
            setTimeout(() => {
              handleBiometricAuthWithRetry();
            }, 800);
          }
        } catch (error) {
          console.warn('Auto biometric trigger failed:', error);
          setLastBiometricError(error.message);
          setShouldAutoTriggerBiometric(false);
        }
      }
    };

    if (phoneNumber && biometricPreference !== 'disabled') {
      checkBiometricAndLogin();
    }
  }, [biometricInitialized, isBiometricAvailable, hasSavedCredentials, phoneNumber, biometricPreference]);

  // Initialize biometric system
  const initializeBiometrics = async () => {
    try {
      const status = await biometricManager.initialize();
      setBiometricStatus(status);
      setIsBiometricAvailable(status.isAvailable);
      setBiometricInitialized(true);
      
      if (status.isAvailable) {
        const credentials = await getBiometricCredentials();
        setHasSavedCredentials(!!credentials);
      } else {
        console.log('Biometric not available:', status.reason);
      }
    } catch (error) {
      console.error('Biometric initialization failed:', error);
      setIsBiometricAvailable(false);
      setBiometricInitialized(true);
      setLastBiometricError(error.message);
    }
  };

  // Enhanced error message handling
  const getBiometricErrorMessage = (error) => {
    const errorString = error?.toString() || '';
    
    if (errorString.includes('User canceled') || errorString.includes('cancelled')) {
      return 'Authentication was cancelled. Use your PIN to continue.';
    }
    if (errorString.includes('Too many attempts') || errorString.includes('lockout')) {
      return 'Too many failed attempts. Please use your PIN or try again later.';
    }
    if (errorString.includes('not available') || errorString.includes('hardware')) {
      return 'Biometric authentication is not available on this device.';
    }
    if (errorString.includes('not enrolled') || errorString.includes('no biometrics')) {
      return 'No biometric authentication is set up. Please use your PIN.';
    }
    if (errorString.includes('system') || errorString.includes('busy')) {
      return 'System is busy. Please try again or use your PIN.';
    }
    if (errorString.includes('permission')) {
      return 'Biometric permission denied. Please enable in device settings.';
    }
    
    return 'Biometric authentication failed. Please use your PIN.';
  };

  // Save biometric preference
  const saveBiometricPreference = async (preference) => {
    try {
      await SecureStorageManager.setItem('biometric_preference', preference);
      setBiometricPreference(preference);
      
      // Clear auto-trigger if disabled
      if (preference === 'disabled') {
        setShouldAutoTriggerBiometric(false);
      }
    } catch (error) {
      console.warn('Failed to save biometric preference:', error);
    }
  };

  // Toggle biometric preference between auto and disabled
  const toggleBiometricPreference = () => {
    const newPreference = biometricPreference === 'auto' ? 'disabled' : 'auto';
    saveBiometricPreference(newPreference);
  };

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

      // Normal login flow - save credentials and proceed
      await saveBiometricCredentials(phoneNumber, pinString);
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

  // Main biometric authentication with retry logic
  const handleBiometricAuthWithRetry = async (retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      setBiometricRetryCount(retryCount);
      const credentials = await getBiometricCredentials();
      
      if (!credentials) {
        if (shouldAutoTriggerBiometric) {
          setShouldAutoTriggerBiometric(false);
          return;
        }
        Alert.alert('Error', 'No biometric credentials found. Please login with PIN first.');
        return;
      }

      const primaryType = biometricManager.getPrimaryBiometricType();
      const isFingerprint = primaryType?.type === 'FINGERPRINT';
      const isFace = primaryType?.type === 'FACE';

      let promptMessage = 'Place your finger on the sensor or look at your device';
      if (isFingerprint) {
        promptMessage = retryCount > 0 ? 'Try fingerprint again' : 'Place your finger on the sensor';
      } else if (isFace) {
        promptMessage = retryCount > 0 ? 'Try face unlock again' : 'Look at your device for face unlock';
      }

      const result = await biometricManager.authenticate({
        promptMessage,
        fallbackLabel: 'Use PIN',
        requireConfirmation: true,
      });

      if (result.success) {
        setBiometricRetryCount(0);
        setLastBiometricError(null);
        setIsLoading(true);
        
        const response = await loginUser({
          PhoneNumber: credentials.phoneNumber,
          PIN: credentials.pin
        });

        dispatch(loginAndLoadUser(response));
        
        setTimeout(() => {
          router.replace("/(mobile)/MobileDashboard");
        }, AUTH_CONFIG.LOGIN_NAVIGATION_DELAY);
      } else {
        // Handle failed authentication
        setLastBiometricError(result.error);
        
        if (retryCount < maxRetries && result.canRetry) {
          // Auto-retry with exponential backoff
          const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s delays
          
          setTimeout(() => {
            handleBiometricAuthWithRetry(retryCount + 1);
          }, delay);
        } else {
          // Max retries reached
          setShouldAutoTriggerBiometric(false);
          
          if (shouldAutoTriggerBiometric) {
            Alert.alert(
              'Authentication Failed',
              getBiometricErrorMessage(result.error),
              [
                { text: 'Use PIN', onPress: () => setShouldAutoTriggerBiometric(false), style: 'default' },
                { 
                  text: 'Try Again', 
                  onPress: () => {
                    setBiometricRetryCount(0);
                    handleBiometricAuthWithRetry(0);
                  }
                }
              ]
            );
          } else {
            Alert.alert('Authentication Failed', getBiometricErrorMessage(result.error));
          }
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      
      if (retryCount < maxRetries) {
        const delay = (retryCount + 1) * 1500; // Longer delays for errors
        setTimeout(() => {
          handleBiometricAuthWithRetry(retryCount + 1);
        }, delay);
      } else {
        setShouldAutoTriggerBiometric(false);
        Alert.alert('Error', getBiometricErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manual biometric authentication trigger
  const handleBiometricAuth = async () => {
    if (!isBiometricAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
      return;
    }
    
    if (!hasSavedCredentials) {
      Alert.alert('No Credentials', 'Please login with PIN first to enable biometric authentication.');
      return;
    }
    
    // Manual trigger for Android
    await handleBiometricAuthWithRetry(0);
  };

  const handlePinChange = (text, index) => {
    if (isLoading || (text && !/^\d$/.test(text))) return;

    const newPin = [...pin];
    newPin[index] = text;
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
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <View style={styles.androidContainer}>
      <TutorialModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        steps={tutorialSteps}
        storageKey="pin_tutorial_shown_android"
        onComplete={() => setShowTutorial(false)}
      />
      
      <View style={styles.androidCardContainer}>
        <View style={pinstyle.headerContainer}>
          <Text style={styles.androidHeaderText}>Enter PIN</Text>
          {isLoading && (
            <Text style={styles.androidSubtitleText}>Verifying PIN...</Text>
          )}
        </View>
        
        <View style={styles.androidPhoneContainer}>
          <View style={styles.phoneInfoRow}>
            <TouchableOpacity
              style={styles.changeNumberButton}
              onPress={async () => {
                try {
                  // Clear biometric credentials when changing phone number
                  await clearBiometricCredentials();
                  console.log('Biometric credentials cleared on phone number change');
                  
                  // Clear phone data from SecureStorage
                  await SecureStorageManager.removeItem(STORAGE_KEYS.TEMP_PHONE);
                  await SecureStorageManager.removeItem('permanent_phone');
                  console.log('Phone data cleared from SecureStorage');
                  
                } catch (error) {
                  console.warn('Failed to clear user data:', error);
                }
                router.replace("/authmobile/Login");
              }}
            >
              <MaterialCommunityIcons name="phone-remove" size={14} color="#303481" />
              <Text style={styles.changeNumberButtonText}>Change</Text>
            </TouchableOpacity>
            <View style={styles.phoneNumberContainer}>
              <Text style={styles.androidPhoneText}>{phoneNumber}</Text>
            </View>
          </View>
        </View>

        {shouldAutoTriggerBiometric && (
          <View style={styles.autoAuthContainer}>
            <MaterialCommunityIcons 
              name={biometricManager.getPrimaryBiometricType()?.icon || 'fingerprint'} 
              size={32} 
              color="#303481" 
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
        )}

        {isBiometricAvailable && hasSavedCredentials && (
          <View style={styles.biometricWrapper}>
            <View style={styles.biometricControlsRow}>
              {!shouldAutoTriggerBiometric && (
                <TouchableOpacity
                  style={[styles.androidBiometricButton, isLoading && { opacity: 0.5 }]}
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
                <MaterialCommunityIcons name="cog" size={18} color="#303481" />
                <Text style={styles.settingsButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={pinstyle.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={[styles.androidPinInput, isLoading && { opacity: 0.5 }]}
              maxLength={1}
              keyboardType="number-pad"
              secureTextEntry={true}
              showSoftInputOnFocus={false}
              value={digit}
              onChangeText={(text) => handlePinChange(text, index)}
              editable={!isLoading && !shouldAutoTriggerBiometric}
            />
          ))}
        </View>

        <View style={[pinstyle.keypadContainer, shouldAutoTriggerBiometric && styles.compactKeypadContainer]}>
          <View style={pinstyle.keypadRow}>
            {[1, 2, 3].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.androidKeypadButton, 
                  shouldAutoTriggerBiometric && styles.compactKeypadButton,
                  (isLoading || shouldAutoTriggerBiometric) && { opacity: 0.5 }
                ]}
                onPress={() => {
                  const currentIndex = pin.findIndex(digit => digit === '');
                  if (currentIndex !== -1) {
                    handlePinChange(num.toString(), currentIndex);
                  }
                }}
                disabled={isLoading || shouldAutoTriggerBiometric}
              >
                <Text style={[styles.androidKeypadButtonText, shouldAutoTriggerBiometric && styles.compactKeypadButtonText]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={pinstyle.keypadRow}>
            {[4, 5, 6].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.androidKeypadButton, 
                  shouldAutoTriggerBiometric && styles.compactKeypadButton,
                  (isLoading || shouldAutoTriggerBiometric) && { opacity: 0.5 }
                ]}
                onPress={() => {
                  const currentIndex = pin.findIndex(digit => digit === '');
                  if (currentIndex !== -1) {
                    handlePinChange(num.toString(), currentIndex);
                  }
                }}
                disabled={isLoading || shouldAutoTriggerBiometric}
              >
                <Text style={[styles.androidKeypadButtonText, shouldAutoTriggerBiometric && styles.compactKeypadButtonText]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={pinstyle.keypadRow}>
            {[7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.androidKeypadButton, 
                  shouldAutoTriggerBiometric && styles.compactKeypadButton,
                  (isLoading || shouldAutoTriggerBiometric) && { opacity: 0.5 }
                ]}
                onPress={() => {
                  const currentIndex = pin.findIndex(digit => digit === '');
                  if (currentIndex !== -1) {
                    handlePinChange(num.toString(), currentIndex);
                  }
                }}
                disabled={isLoading || shouldAutoTriggerBiometric}
              >
                <Text style={[styles.androidKeypadButtonText, shouldAutoTriggerBiometric && styles.compactKeypadButtonText]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={pinstyle.keypadRow}>
            <TouchableOpacity style={[styles.androidKeypadButton, shouldAutoTriggerBiometric && styles.compactKeypadButton, { opacity: 0 }]} disabled />
            <TouchableOpacity
              style={[
                styles.androidKeypadButton, 
                shouldAutoTriggerBiometric && styles.compactKeypadButton,
                (isLoading || shouldAutoTriggerBiometric) && { opacity: 0.5 }
              ]}
              onPress={() => {
                const currentIndex = pin.findIndex(digit => digit === '');
                if (currentIndex !== -1) {
                  handlePinChange('0', currentIndex);
                }
              }}
              disabled={isLoading || shouldAutoTriggerBiometric}
            >
              <Text style={[styles.androidKeypadButtonText, shouldAutoTriggerBiometric && styles.compactKeypadButtonText]}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.androidKeypadButton, 
                shouldAutoTriggerBiometric && styles.compactKeypadButton,
                (isLoading || shouldAutoTriggerBiometric) && { opacity: 0.5 }
              ]}
              onPress={() => {
                const lastIndex = pin.map(digit => digit !== '').lastIndexOf(true);
                if (lastIndex !== -1) {
                  const newPin = [...pin];
                  newPin[lastIndex] = '';
                  setPin(newPin);
                }
              }}
              disabled={isLoading || shouldAutoTriggerBiometric}
            >
              <Text style={[styles.androidKeypadButtonText, shouldAutoTriggerBiometric && styles.compactKeypadButtonText]}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Biometric Preference Modal */}
      <Modal
        visible={showPreferenceModal}
        animationType="slide"
        transparent={false}
        statusBarTranslucent={false}
        onRequestClose={() => setShowPreferenceModal(false)}
        supportedOrientations={['portrait']}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Biometric Settings</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPreferenceModal(false)}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#303481" />
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
                activeOpacity={0.8}
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
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Android-specific container
  androidContainer: {
    flex: 1,
    backgroundColor: '#E0F7FA', // Bluish background like login
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  // Android-specific card
  androidCardContainer: {
    backgroundColor: '#F0F4C3',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    elevation: 6, // Higher elevation for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    flex: 1,
    maxHeight: '92%',
    alignSelf: 'center',
    minHeight: 540,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  // Android header styling
  androidHeaderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#303481',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 4,
  },
  androidSubtitleText: {
    fontSize: 13,
    color: '#303481', // Brand color for Android branding
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  // Biometric controls
  biometricWrapper: {
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 6,
  },
  biometricControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  androidBiometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#303481', // Brand color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10, // Android prefers sharper corners
    elevation: 5,
    shadowColor: '#303481',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flex: 1,
    minHeight: 36,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F8',
    borderWidth: 1.5,
    borderColor: '#303481',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 2,
    minWidth: 75,
  },
  settingsButtonText: {
    color: '#303481',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  biometricButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },

  // Auto authentication container
  autoAuthContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 3,
    backgroundColor: '#F0F0F8',
    borderRadius: 8,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E0E0E8',
    elevation: 2,
    minHeight: 48,
  },
  autoAuthText: {
    fontSize: 12,
    color: '#303481',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Change number button
  changeNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#303481',
    borderRadius: 8,
    backgroundColor: '#F0F0F8', // Light brand color background
    elevation: 2,
    shadowColor: '#303481',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  changeNumberButtonText: {
    color: '#303481',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Android-specific PIN inputs
  androidPinInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#303481', // Brand color border
    borderRadius: 8, // Sharper corners for Android
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    fontWeight: '700',
    color: '#303481',
  },
  // Android-specific keypad buttons
  androidKeypadButton: {
    backgroundColor: '#303481', // Brand color
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, // Slightly rounded for Android
    elevation: 4,
    minHeight: 45,
    maxHeight: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  androidKeypadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  // Compact keypad styles for when auto biometric is active
  compactKeypadContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  compactKeypadButton: {
    minHeight: 38,
    maxHeight: 42,
    elevation: 3,
  },
  compactKeypadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Android phone display
  androidPhoneContainer: {
    marginBottom: 18,
    paddingHorizontal: 2,
    paddingRight: 0,
  },
  phoneInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingRight: 0,
    marginRight: 0,
  },
  androidPhoneText: {
    fontSize: 15,
    color: '#1A237E',
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'left',
  },

  retryText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  // Modal styles - Material Design
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Material background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56, // Status bar consideration
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#303481',
    letterSpacing: 0.15,
  },
  modalCloseButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    elevation: 2,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#303481',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  toggleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#303481',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E8EAF6',
  },
  toggleLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#303481',
    marginBottom: 12,
    letterSpacing: 0.15,
  },
  toggleDescription: {
    fontSize: 16,
    color: '#616161', // Material secondary text
    lineHeight: 24,
    marginBottom: 28,
    letterSpacing: 0.15,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#303481',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleButtonActive: {
    backgroundColor: '#E8F0FE', // Material primary container
    elevation: 6,
    borderColor: '#303481',
    shadowOpacity: 0.15,
  },
  toggleSwitch: {
    width: 56,
    height: 32,
    backgroundColor: '#BDBDBD', // Material switch track off
    borderRadius: 16,
    marginRight: 20,
    justifyContent: 'center',
    paddingHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#7986CB', // Lighter version of brand color
  },
  toggleKnob: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignSelf: 'flex-start',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#303481',
    borderColor: '#303481',
  },
  toggleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#303481',
    letterSpacing: 0.15,
  },
  toggleTextActive: {
    color: '#303481',
    fontWeight: '700',
  },
  statusText: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.15,
    marginTop: 8,
  },
  phoneNumberContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: '#F3F4F8',
    borderWidth: 1.5,
    borderColor: '#9FA8DA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#303481',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    flex: 1,
    marginLeft: 10,
    marginRight: 0,
    minHeight: 36,
  },
}); 