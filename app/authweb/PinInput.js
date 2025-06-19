import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler, Alert } from 'react-native';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'expo-router';
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { loginUser } from '../(services)/api/api';
import { loginAndLoadUser } from "../(redux)/authSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AUTH_CONFIG, 
  STORAGE_KEYS, 
  SecurityValidators, 
  FirstTimePinSecurity,
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES 
} from '../(services)/config/security.config';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  phoneContainer: {
    marginBottom: 20,
  },
  phoneText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 15,
  },
  pinInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#fff',
  },
  pinInputFilled: {
    borderColor: '#303481',
    backgroundColor: '#f8f9ff',
  },
  keypadContainer: {
    width: '100%',
    maxWidth: 300,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  numericButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  numericButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#303481',
  },
  loginButtonText: {
    color: '#fff',
  },
  errorText: {
    color: '#ff0000',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  loadingText: {
    color: '#303481',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
  // Responsive styles
  '@media (max-width: 768px)': {
    container: {
      padding: 15,
    },
    pinInput: {
      width: 45,
      height: 45,
      fontSize: 20,
    },
    numericButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    numericButtonText: {
      fontSize: 20,
    },
  },
  '@media (max-width: 480px)': {
    headerText: {
      fontSize: 20,
    },
    subtitleText: {
      fontSize: 14,
    },
    pinInput: {
      width: 40,
      height: 40,
      fontSize: 18,
    },
    numericButton: {
      width: 55,
      height: 55,
      borderRadius: 27.5,
    },
    numericButtonText: {
      fontSize: 18,
    },
  },
});

export default function PinInput() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [pin, setPin] = useState(['', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const inputRefs = useRef([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [secureTextIndexes, setSecureTextIndexes] = useState([true, true, true, true]);
  const [isLoading, setIsLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: loginUser,
    mutationKey: ["login"]
  });

  useEffect(() => {
    const getPhoneNumber = async () => {
      const phone = await AsyncStorage.getItem('tempPhone');
      setPhoneNumber(phone);
    };
    getPhoneNumber();
  }, []);

  const handlePinChange = (text, index) => {
    // Prevent input during loading
    if (isLoading) {
      return;
    }

    // Only allow numeric input
    if (text && !/^\d$/.test(text)) {
      return;
    }

    const newPin = [...pin];
    const newSecureIndexes = [...secureTextIndexes];
    newPin[index] = text;
    
    if (text) {
      // Temporarily show the number
      newSecureIndexes[index] = false;
      setSecureTextIndexes(newSecureIndexes);
      
      // Hide it after a short delay
      setTimeout(() => {
        setSecureTextIndexes(prev => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      }, 100); // 100ms delay
    }

    setPin(newPin);

    // Auto-focus next input if current input is filled and not the last one
    if (text && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    // Check if all 4 digits are filled and valid before triggering login
    if (newPin.every(digit => digit !== '' && /^\d$/.test(digit)) && newPin.length === 4) {
      const pinString = newPin.join('');
      // Add a small delay to ensure UI updates are complete
      setTimeout(() => {
        handleLogin(pinString);
      }, 200);
    }
  };

  const handleKeyPress = (number) => {
    // Prevent input during loading
    if (isLoading) {
      return;
    }

    // Ensure number is valid (0-9)
    if (typeof number !== 'number' || number < 0 || number > 9) {
      return;
    }

    const currentIndex = pin.findIndex(digit => digit === '');
    if (currentIndex !== -1 && currentIndex < 4) {
      handlePinChange(number.toString(), currentIndex);
    }
  };

  const handleBackspace = () => {
    // Prevent input during loading
    if (isLoading) {
      return;
    }

    const lastFilledIndex = pin.map(digit => digit !== '').lastIndexOf(true);
    if (lastFilledIndex !== -1) {
      const newPin = [...pin];
      newPin[lastFilledIndex] = '';
      setPin(newPin);
    }
  };

  const clearPin = () => {
    setPin(['', '', '', '']);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  const showError = (message, type = 'error') => {
    Alert.alert(
      type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Notice',
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const handleLogin = async (pinString) => {
    // Enhanced PIN validation using security validators
    const validation = SecurityValidators.validatePin(pinString);
    if (!validation.isValid) {
      showError(validation.error);
      clearPin();
      return;
    }

    // Validate phone number exists
    if (!phoneNumber) {
      showError(ERROR_MESSAGES.PHONE_REQUIRED);
      setTimeout(() => router.back(), 2000);
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

      if (!response || !response.user) {
        throw new Error('Invalid response data from server');
      }

      if (!response.user || typeof response.user !== 'object') {
        throw new Error('Invalid user data received');
      }

      // If login is successful and user used default PIN, trigger first-time PIN change
      if (isDefaultPin) {
        // Check OTCPIN status to determine if first-time PIN change is required
        const otcpinDisabled = await AsyncStorage.getItem(STORAGE_KEYS.OTCPIN_DISABLED);
        const hasOtcpinAccess = !otcpinDisabled || otcpinDisabled !== 'true';
        
        if (hasOtcpinAccess) {
          // User has OTCPIN access and is using default PIN - force PIN change
          await FirstTimePinSecurity.triggerFirstTimePinChange(
            phoneNumber, 
            'Default PIN detected on successful web login'
          );
          
          // Save user phone for first-time PIN setup
          await AsyncStorage.setItem(STORAGE_KEYS.USER_PHONE_NUMBER, phoneNumber);
          
          Alert.alert(
            ERROR_MESSAGES.FIRST_TIME_LOGIN_TITLE,
            ERROR_MESSAGES.FIRST_TIME_PIN_REQUIRED,
            [
              {
                text: 'Change PIN Now',
                onPress: () => {
                  router.replace('/authweb/FirstTimePinSetup');
                }
              }
            ],
            { cancelable: false }
          );
          return;
        }
      }

      // Normal login flow - proceed
      await AsyncStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, '0');
      await AsyncStorage.removeItem('tempPhone');
      setFailedAttempts(0);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      dispatch(loginAndLoadUser(response));
      
      setTimeout(() => {
        router.replace("/(web)/WebDashboard");
      }, AUTH_CONFIG.LOGIN_NAVIGATION_DELAY);
      
    } catch (error) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      clearPin();

      if (newAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
        showError('Too many failed attempts. Please try again later.');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';
        showError(`${errorMessage}\n\nAttempts remaining: ${AUTH_CONFIG.MAX_LOGIN_ATTEMPTS - newAttempts}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const NumericButton = ({ number, onPress }) => (
    <TouchableOpacity 
      style={[styles.numericButton, isLoading && { opacity: 0.5 }]} 
      onPress={onPress}
      disabled={isLoading}
    >
      <Text style={styles.numericButtonText}>{number}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Enter PIN</Text>
        <Text style={styles.subtitleText}>
          Enter your 4-digit PIN to continue
        </Text>
      </View>

      {phoneNumber && (
        <View style={styles.phoneContainer}>
          <Text style={styles.phoneText}>
            +{phoneNumber}
          </Text>
        </View>
      )}

      {mutation.isError && !isLoading && (
        <Text style={styles.errorText}>
          {mutation.error?.response?.data?.message || 'Invalid PIN'}
        </Text>
      )}

      {failedAttempts > 0 && failedAttempts < 3 && !isLoading && (
        <Text style={styles.errorText}>
          Attempts remaining: {3 - failedAttempts}
        </Text>
      )}

      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.pinInput,
              digit !== '' && styles.pinInputFilled
            ]}
            value={secureTextIndexes[index] && digit ? '•' : digit}
            onChangeText={(text) => handlePinChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!isLoading}
            selectTextOnFocus
          />
        ))}
      </View>

      {isLoading && (
        <Text style={styles.loadingText}>
          Authenticating...
        </Text>
      )}

      <View style={styles.keypadContainer}>
        <View style={styles.keypadRow}>
          <NumericButton number="1" onPress={() => handleKeyPress(1)} />
          <NumericButton number="2" onPress={() => handleKeyPress(2)} />
          <NumericButton number="3" onPress={() => handleKeyPress(3)} />
        </View>
        <View style={styles.keypadRow}>
          <NumericButton number="4" onPress={() => handleKeyPress(4)} />
          <NumericButton number="5" onPress={() => handleKeyPress(5)} />
          <NumericButton number="6" onPress={() => handleKeyPress(6)} />
        </View>
        <View style={styles.keypadRow}>
          <NumericButton number="7" onPress={() => handleKeyPress(7)} />
          <NumericButton number="8" onPress={() => handleKeyPress(8)} />
          <NumericButton number="9" onPress={() => handleKeyPress(9)} />
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity 
            style={[styles.numericButton, isLoading && { opacity: 0.5 }]}
            onPress={handleBackspace}
            disabled={isLoading}
          >
            <Text style={styles.numericButtonText}>⌫</Text>
          </TouchableOpacity>
          <NumericButton number="0" onPress={() => handleKeyPress(0)} />
          <TouchableOpacity 
            style={[
              styles.numericButton, 
              styles.loginButton,
              (pin.every(digit => digit !== '') && !isLoading)
                ? {} 
                : { opacity: 0.5 }
            ]}
            onPress={() => {
              const pinString = pin.join('');
              if (pinString.length === 4) {
                handleLogin(pinString);
              }
            }}
            disabled={!pin.every(digit => digit !== '') || isLoading}
          >
            <Text style={[styles.numericButtonText, styles.loginButtonText]}>
              {isLoading ? '...' : '➔'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 