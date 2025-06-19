import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler, Alert, Image } from 'react-native';
import React, { useEffect, useState } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecureStorageManager from '../(services)/utils/SecureStorage';
import { STORAGE_KEYS } from '../(services)/config/security.config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginstyle } from '../components/styles/mobilestyle';
import { 
  validatePhoneNumber, 
  loginUser,
  getBiometricCredentials
} from '../(services)/api/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import TutorialModal from '../components/TutorialModal';
import biometricManager from '../(services)/utils/BiometricManager';

const PhoneSchema = Yup.object().shape({
  PhoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
});

export default function LoginIOS() {
  const router = useRouter();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [initialPhoneNumber, setInitialPhoneNumber] = useState('');
  const [biometricStatus, setBiometricStatus] = useState(null);
  const [canUseBiometric, setCanUseBiometric] = useState(false);
  const [shouldAutoTriggerBiometric, setShouldAutoTriggerBiometric] = useState(false);

  const tutorialSteps = [
    {
      title: 'Welcome to iOS Login',
      description: 'Enter your registered phone number to access your account securely on iOS.'
    },
    {
      title: 'Face ID & Touch ID',
      description: 'On iOS, you can use Face ID or Touch ID for seamless and secure authentication.'
    },
    {
      title: 'Automatic Authentication',
      description: 'If you have biometric credentials saved, Face ID or Touch ID will automatically prompt.'
    }
  ];

  useEffect(() => {
    const loadFailedAttempts = async () => {
      try {
        const storedAttempts = await AsyncStorage.getItem('failedAttempts');
        if (storedAttempts) {
          const attempts = parseInt(storedAttempts);
          setFailedAttempts(attempts);
          if (attempts >= 3) {
            router.replace("/authmobile/Blocked");
          }
        }
      } catch (error) {
        // Silent error handling
      }
    };
    loadFailedAttempts();
  }, []);

  useEffect(() => {
    const backAction = () => {
      setShowExitConfirmation(true);
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      backHandlerSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const isFirstTime = await AsyncStorage.getItem('login_tutorial_shown_ios');
        if (!isFirstTime) {
          setShowTutorial(true);
        }
      } catch (error) {
        // Silent error handling
      }
    };

    checkFirstTimeUser();
  }, []);

  useEffect(() => {
    const initializeBiometricAndPhone = async () => {
      try {
        const status = await biometricManager.initialize();
        setBiometricStatus(status);
        setCanUseBiometric(status.isAvailable);

        // Check for saved phone using SecureStorage only
        let savedPhone = await SecureStorageManager.getItem('permanent_phone');
        if (!savedPhone) {
          savedPhone = await SecureStorageManager.getItem(STORAGE_KEYS.TEMP_PHONE);
        }

        if (savedPhone) {
          setIsLoading(true);
          const displayPhone = savedPhone.startsWith('63') ? savedPhone.slice(2) : savedPhone;
          setInitialPhoneNumber(displayPhone);
          
          try {
            const validationResult = await validatePhoneNumber(savedPhone);
            if (validationResult.isRegistered) {
              await SecureStorageManager.setItem(STORAGE_KEYS.TEMP_PHONE, savedPhone);
              // Auto-redirect to PIN input immediately
              setTimeout(() => {
                router.replace("/authmobile/PinInput");
              }, 500);
              return;
            } else {
              // Clear phone storage keys
              await SecureStorageManager.removeItem('permanent_phone');
              await SecureStorageManager.removeItem(STORAGE_KEYS.TEMP_PHONE);
              setInitialPhoneNumber('');
              setValidationError('Saved phone number is no longer valid.');
            }
          } catch (error) {
            // Clear phone storage keys on error
            await SecureStorageManager.removeItem('permanent_phone');
            await SecureStorageManager.removeItem(STORAGE_KEYS.TEMP_PHONE);
            setInitialPhoneNumber('');
            setValidationError('Unable to validate saved phone number.');
          }
        }
      } catch (error) {
        // Clear phone storage keys on error
        await SecureStorageManager.removeItem('permanent_phone');
        await SecureStorageManager.removeItem(STORAGE_KEYS.TEMP_PHONE);
        setInitialPhoneNumber('');
      } finally {
        setIsLoading(false);
      }
    };

    initializeBiometricAndPhone();
  }, []);

  const showError = (message, type = 'error') => {
    Alert.alert(
      type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Notice',
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const handleExitConfirm = () => {
    setShowExitConfirmation(false);
    BackHandler.exitApp();
  };

  const handleExitCancel = () => {
    setShowExitConfirmation(false);
  };

  const handleBiometricLogin = async () => {
    if (isLoading && !shouldAutoTriggerBiometric) return;
    
    try {
      setIsLoading(true);
      const credentials = await getBiometricCredentials();
      if (!credentials) {
        if (shouldAutoTriggerBiometric) {
          setShouldAutoTriggerBiometric(false);
          return;
        }
        Alert.alert('Error', 'No biometric credentials found.');
        return;
      }

      const primaryType = biometricManager.getPrimaryBiometricType();
      const isFaceID = primaryType?.type === 'FACE_ID';
      const isTouchID = primaryType?.type === 'FINGERPRINT';

      let promptMessage = 'Authenticate to access your account';
      if (isFaceID) {
        promptMessage = 'Use Face ID to sign in';
      } else if (isTouchID) {
        promptMessage = 'Use Touch ID to sign in';
      }

      const result = await biometricManager.authenticate({
        promptMessage,
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
        requireConfirmation: false,
      });

      if (result.success) {
        const response = await loginUser({
          PhoneNumber: credentials.phoneNumber,
          PIN: credentials.pin
        });

        if (response && response.user) {
          await AsyncStorage.setItem('failedAttempts', '0');
          await AsyncStorage.removeItem('tempPhone');
          router.replace("/(mobile)/MobileDashboard");
        }
      } else if (result.shouldFallbackToPIN) {
        router.replace("/authmobile/PinInput");
      } else if (shouldAutoTriggerBiometric) {
        Alert.alert(
          'Authentication Failed',
          'Would you like to try again or use your PIN?',
          [
            { text: 'Use PIN', onPress: () => router.replace("/authmobile/PinInput") },
            { text: 'Try Again', onPress: () => handleBiometricLogin() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      if (shouldAutoTriggerBiometric) {
        Alert.alert(
          'Biometric Authentication Unavailable',
          'Please use your PIN to sign in.',
          [{ text: 'Use PIN', onPress: () => router.replace("/authmobile/PinInput") }]
        );
      } else {
        Alert.alert('Error', `Biometric login failed: ${error.message}`);
        router.replace("/authmobile/PinInput");
      }
    } finally {
      setIsLoading(false);
      setShouldAutoTriggerBiometric(false);
    }
  };

  const handlePhoneSubmit = async (values) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setValidationError('');
      
      if (!values.PhoneNumber || values.PhoneNumber.length !== 10) {
        setValidationError('Please enter a valid 10-digit phone number');
        return;
      }

      const fullPhoneNumber = `63${values.PhoneNumber}`;
      const validationResult = await validatePhoneNumber(fullPhoneNumber);
      
      if (!validationResult.isRegistered) {
        Alert.alert('Warning', 'This phone number is not registered in our system.');
        return;
      }
      
      // Save to SecureStorage only
      await SecureStorageManager.setItem(STORAGE_KEYS.TEMP_PHONE, fullPhoneNumber);
      await SecureStorageManager.setItem('permanent_phone', fullPhoneNumber);
      
      router.replace("/authmobile/PinInput");
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const NumericButton = ({ number, onPress }) => (
    <TouchableOpacity 
      style={[loginstyle.numericButton, isLoading && { opacity: 0.5 }]} 
      onPress={onPress}
      disabled={isLoading}
    >
      <Text style={loginstyle.numericButtonText}>{number}</Text>
    </TouchableOpacity>
  );

  const handleNumericInput = async (formikProps, num) => {
    if (isLoading) return;
    setValidationError('');
    const currentValue = formikProps.values.PhoneNumber;
    if (currentValue.length < 10) {
      const newValue = currentValue + num;
      formikProps.setFieldValue("PhoneNumber", newValue);
      
      // Auto-submit when 10 digits are entered
      if (newValue.length === 10) {
        setTimeout(async () => {
          await handlePhoneSubmit({ PhoneNumber: newValue });
        }, 100);
      }
    }
  };

  const handleBackspace = (formikProps) => {
    if (isLoading) return;
    setValidationError('');
    formikProps.setFieldValue("PhoneNumber", formikProps.values.PhoneNumber.slice(0, -1));
  };

  const renderBiometricButton = () => {
    if (!canUseBiometric || shouldAutoTriggerBiometric) return null;

    const primaryType = biometricManager.getPrimaryBiometricType();
    const isFaceID = primaryType?.type === 'FACE_ID';
    const isTouchID = primaryType?.type === 'FINGERPRINT';
    
    let iconName = 'fingerprint';
    let buttonText = 'Use Biometric Login';
    
    if (isFaceID) {
      iconName = 'face-recognition';
      buttonText = 'Use Face ID';
    } else if (isTouchID) {
      iconName = 'fingerprint';
      buttonText = 'Use Touch ID';
    }

    return (
      <TouchableOpacity 
        style={[loginstyle.biometricButton, loginstyle.iosBiometricButton, isLoading && { opacity: 0.5 }]}
        onPress={handleBiometricLogin}
        disabled={isLoading}
      >
        <MaterialCommunityIcons 
          name={iconName} 
          size={24} 
          color="#FFFFFF" 
          style={{ marginRight: 8 }}
        />
        <Text style={loginstyle.biometricButtonText}>
          {isLoading ? 'Authenticating...' : buttonText}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={loginstyle.container}>
      <TutorialModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        steps={tutorialSteps}
        storageKey="login_tutorial_shown_ios"
        onComplete={() => setShowTutorial(false)}
      />

      <View style={{ flex: 0 }}>
        <View style={[loginstyle.welcomeContainer, { marginTop: 60 }]}>
          <Text style={loginstyle.welcomeText}>Welcome to Cooperative!</Text>
          <Text style={loginstyle.subtitleText}>
            Please enter your 10-digit phone number to continue securely.
          </Text>

        </View>

        <ConfirmationModal
          visible={showExitConfirmation}
          title="Exit App"
          message="Are you sure you want to exit the application?"
          confirmText="Exit"
          cancelText="Cancel"
          onConfirm={handleExitConfirm}
          onCancel={handleExitCancel}
          type="warning"
        />
      </View>

      {shouldAutoTriggerBiometric && (
        <View style={loginstyle.autoAuthContainer}>
          <MaterialCommunityIcons 
            name={biometricManager.getPrimaryBiometricType()?.icon || 'fingerprint'} 
            size={48} 
            color="#303481" 
          />
          <Text style={loginstyle.autoAuthText}>
            Authenticating with {biometricManager.getPrimaryBiometricType()?.name || 'Biometrics'}...
          </Text>
        </View>
      )}

      <Formik
        initialValues={{ PhoneNumber: initialPhoneNumber }}
        validationSchema={PhoneSchema}
        onSubmit={handlePhoneSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <View style={{ flex: 1 }}>
            {(formikProps.errors.PhoneNumber && formikProps.touched.PhoneNumber) || validationError ? (
              <Text style={loginstyle.errorText}>
                {validationError || formikProps.errors.PhoneNumber}
              </Text>
            ) : null}
            
            <View style={loginstyle.phoneInputContainer}>
              <Text style={loginstyle.countryCode}>+63</Text>
              <View style={loginstyle.inputWrapper}>
                <TextInput
                  style={loginstyle.input}
                  value={formikProps.values.PhoneNumber}
                  editable={false}
                  placeholder="XXXXXXXXXX"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
            </View>

            {formikProps.values.PhoneNumber.length > 0 && !isLoading && (
              <Text style={[
                loginstyle.phoneText, 
                { 
                  textAlign: 'center', 
                  marginTop: 10,
                  color: formikProps.values.PhoneNumber.length === 10 ? '#28a745' : '#ffc107'
                }
              ]}>
                {formikProps.values.PhoneNumber.length}/10 digits
                {formikProps.values.PhoneNumber.length === 10 && ' ✓'}
              </Text>
            )}

            <View style={[loginstyle.cardContainer, { marginTop: 20, flex: 1 }]}>
              <View style={[loginstyle.form, { flex: 1, justifyContent: 'center' }]}>
                <View style={loginstyle.keypadContainer}>
                  <View style={loginstyle.keypadRow}>
                    <NumericButton number="1" onPress={() => handleNumericInput(formikProps, "1")} />
                    <NumericButton number="2" onPress={() => handleNumericInput(formikProps, "2")} />
                    <NumericButton number="3" onPress={() => handleNumericInput(formikProps, "3")} />
                  </View>
                  <View style={loginstyle.keypadRow}>
                    <NumericButton number="4" onPress={() => handleNumericInput(formikProps, "4")} />
                    <NumericButton number="5" onPress={() => handleNumericInput(formikProps, "5")} />
                    <NumericButton number="6" onPress={() => handleNumericInput(formikProps, "6")} />
                  </View>
                  <View style={loginstyle.keypadRow}>
                    <NumericButton number="7" onPress={() => handleNumericInput(formikProps, "7")} />
                    <NumericButton number="8" onPress={() => handleNumericInput(formikProps, "8")} />
                    <NumericButton number="9" onPress={() => handleNumericInput(formikProps, "9")} />
                  </View>
                  <View style={loginstyle.keypadRow}>
                    <TouchableOpacity 
                      style={[loginstyle.numericButton, isLoading && { opacity: 0.5 }]}
                      onPress={() => handleBackspace(formikProps)}
                      disabled={isLoading}
                    >
                      <Text style={loginstyle.numericButtonText}>⌫</Text>
                    </TouchableOpacity>
                    <NumericButton number="0" onPress={() => handleNumericInput(formikProps, "0")} />
                    <TouchableOpacity style={[loginstyle.numericButton, { opacity: 0 }]} disabled />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
} 