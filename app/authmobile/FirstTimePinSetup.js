import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Vibration,
  TextInput,
} from 'react-native';
import { changePIN } from '../(services)/api/api';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pinstyle } from '../components/styles/mobilestyle';
import { 
  AUTH_CONFIG, 
  STORAGE_KEYS, 
  SecurityValidators, 
  FirstTimePinSecurity,
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES 
} from '../(services)/config/security.config';
import SecureStorageManager from '../(services)/utils/SecureStorage';

const FirstTimePinSetup = () => {
  const [newPIN, setNewPIN] = useState(['', '', '', '']);
  const [confirmPIN, setConfirmPIN] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('new'); // 'new', 'confirm'
  const [lockoutInfo, setLockoutInfo] = useState({ isLocked: false, remainingTime: 0 });
  const router = useRouter();

  const handlePinChange = (text, index) => {
    if (loading) return;

    // Only allow numeric input
    if (text && !/^\d$/.test(text)) {
      return;
    }

    const currentPIN = step === 'new' ? newPIN : confirmPIN;
    const setPIN = step === 'new' ? setNewPIN : setConfirmPIN;
    
    const newPinArray = [...currentPIN];
    newPinArray[index] = text;
    setPIN(newPinArray);

    // Auto-focus next input if current input is filled and not the last one
    if (text && index < 3) {
      // Focus next input logic would go here if using TextInput refs
    }

    // Remove auto-submission - let user use confirmation button instead
  };

  const handleKeyPress = (number) => {
    if (loading) return;

    const currentPIN = step === 'new' ? newPIN : confirmPIN;
    const setPIN = step === 'new' ? setNewPIN : setConfirmPIN;
    
    const currentIndex = currentPIN.findIndex(digit => digit === '');
    if (currentIndex !== -1 && currentIndex < AUTH_CONFIG.PIN_LENGTH) {
      handlePinChange(number.toString(), currentIndex);
    }
  };

  const handleBackspace = () => {
    if (loading) return;

    const currentPIN = step === 'new' ? newPIN : confirmPIN;
    const setPIN = step === 'new' ? setNewPIN : setConfirmPIN;
    
    const lastFilledIndex = currentPIN.map(digit => digit !== '').lastIndexOf(true);
    if (lastFilledIndex !== -1) {
      const newPinArray = [...currentPIN];
      newPinArray[lastFilledIndex] = '';
      setPIN(newPinArray);
    }
  };

  const clearPin = () => {
    if (step === 'new') {
      setNewPIN(['', '', '', '']);
    } else {
      setConfirmPIN(['', '', '', '']);
    }
  };

  const handleNext = () => {
    if (step === 'new' && newPIN.every(digit => digit !== '')) {
      Vibration.vibrate(50);
      setStep('confirm');
      setConfirmPIN(['', '', '', '']);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('new');
      setConfirmPIN(['', '', '', '']);
    }
  };

  const handleSetupPIN = async () => {
    try {
      setLoading(true);

      // Check for lockout before proceeding
      const lockout = await FirstTimePinSecurity.checkFirstTimePinLockout();
      if (lockout.isLocked) {
        const minutes = Math.ceil(lockout.remainingTime / 60000);
        Alert.alert('Temporarily Locked', `Please wait ${minutes} minute(s) before trying again.`);
        setLockoutInfo(lockout);
        return;
      }

      const newPinString = newPIN.join('');
      const confirmPinString = confirmPIN.join('');

      // Enhanced PIN validation using new security validators
      const validation = SecurityValidators.validateFirstTimePin(newPinString, confirmPinString);
      if (!validation.isValid) {
        Alert.alert('Error', validation.error);
        
        // Increment failed attempts
        const attempts = await FirstTimePinSecurity.incrementFirstTimePinAttempts();
        
        if (attempts >= AUTH_CONFIG.FIRST_TIME_PIN_MAX_ATTEMPTS) {
          Alert.alert(
            'Too Many Attempts', 
            'Too many failed attempts. Please wait 5 minutes before trying again.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/authmobile/Login')
              }
            ]
          );
          return;
        }
        
        clearPin();
        return;
      }

      const phoneNumber = await SecureStorageManager.getItem(STORAGE_KEYS.USER_PHONE_NUMBER);
      if (!phoneNumber) {
        Alert.alert('Error', 'Session expired. Please login again.');
        router.replace('/authmobile/Login');
        return;
      }

      // Use the default PIN as the old PIN for first-time setup
      const response = await changePIN(phoneNumber, AUTH_CONFIG.DEFAULT_PIN, newPinString, true);

      if (response.success) {
        // Mark first-time PIN change as completed
        await FirstTimePinSecurity.markFirstTimePinCompleted(phoneNumber);
        
        // Reset failed attempts
        await FirstTimePinSecurity.resetFirstTimePinAttempts();
        
        Alert.alert(
          'Success', 
          SUCCESS_MESSAGES.FIRST_TIME_PIN_SETUP_COMPLETE,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(mobile)/MobileDashboard')
            }
          ]
        );
      } else {
        // Increment failed attempts on API error
        await FirstTimePinSecurity.incrementFirstTimePinAttempts();
        
        Alert.alert('Error', response.message || 'Failed to change PIN. Please try again.');
        setStep('new');
        setNewPIN(['', '', '', '']);
        setConfirmPIN(['', '', '', '']);
      }
    } catch (error) {
      // Increment failed attempts on any error
      await FirstTimePinSecurity.incrementFirstTimePinAttempts();
      
      Alert.alert('Error', error.message || 'An unexpected error occurred. Please try again.');
      setStep('new');
      setNewPIN(['', '', '', '']);
      setConfirmPIN(['', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (step === 'new') {
      handleNext();
    } else {
      handleSetupPIN();
    }
  };

  const isPinComplete = () => {
    const currentPIN = step === 'new' ? newPIN : confirmPIN;
    return currentPIN.every(digit => digit !== '' && /^\d$/.test(digit));
  };

  const getStepTitle = () => {
    return step === 'new' ? 'Create New PIN' : 'Confirm New PIN';
  };

  const getStepSubtitle = () => {
    return step === 'new' 
      ? `Choose a secure ${AUTH_CONFIG.PIN_LENGTH}-digit PIN` 
      : 'Re-enter your PIN to confirm';
  };

  return (
    <View style={pinstyle.container}>
      <View style={[pinstyle.cardContainer, styles.optimizedCard]}>
        <View style={[pinstyle.headerContainer, styles.compactHeader]}>
          <Ionicons name="shield-checkmark" size={32} color="#303481" style={{ marginBottom: 8 }} />
          <Text style={[pinstyle.headerText, styles.compactTitle]}>{getStepTitle()}</Text>
          
          {loading && (
            <Text style={[pinstyle.subtitleText, styles.compactSubtitle]}>
              Setting up your PIN...
            </Text>
          )}
          
          {!loading && (
            <Text style={[pinstyle.subtitleText, styles.compactSubtitle]}>
              {getStepSubtitle()}
            </Text>
          )}
        </View>

        <View style={[pinstyle.phoneContainer, styles.compactPhoneContainer]}>
          {step === 'confirm' && (
            <TouchableOpacity
              style={pinstyle.backButton}
              onPress={handleBack}
            >
              <Text style={pinstyle.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <Text style={[pinstyle.phoneText, styles.compactPhoneText]}>
            For your security, replace the default PIN
          </Text>
        </View>

        <View style={[pinstyle.pinContainer, styles.compactPinContainer]}>
          {(step === 'new' ? newPIN : confirmPIN).map((digit, index) => (
            <TextInput
              key={index}
              style={[
                pinstyle.pinInput,
                styles.compactPinInput,
                loading && { opacity: 0.5 }
              ]}
              maxLength={1}
              keyboardType="number-pad"
              secureTextEntry={true}
              showSoftInputOnFocus={false}
              value={digit}
              onChangeText={(text) => handlePinChange(text, index)}
              editable={!loading}
            />
          ))}
        </View>

        <View style={[pinstyle.keypadContainer, styles.compactKeypadContainer]}>
          <View style={pinstyle.keypadRow}>
            {[1, 2, 3].map((number) => (
              <TouchableOpacity
                key={number}
                style={[pinstyle.keypadButton, styles.compactKeypadButton, loading && { opacity: 0.5 }]}
                onPress={() => handleKeyPress(number)}
                disabled={loading}
              >
                <Text style={[pinstyle.keypadButtonText, styles.compactKeypadText]}>{number}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={pinstyle.keypadRow}>
            {[4, 5, 6].map((number) => (
              <TouchableOpacity
                key={number}
                style={[pinstyle.keypadButton, styles.compactKeypadButton, loading && { opacity: 0.5 }]}
                onPress={() => handleKeyPress(number)}
                disabled={loading}
              >
                <Text style={[pinstyle.keypadButtonText, styles.compactKeypadText]}>{number}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={pinstyle.keypadRow}>
            {[7, 8, 9].map((number) => (
              <TouchableOpacity
                key={number}
                style={[pinstyle.keypadButton, styles.compactKeypadButton, loading && { opacity: 0.5 }]}
                onPress={() => handleKeyPress(number)}
                disabled={loading}
              >
                <Text style={[pinstyle.keypadButtonText, styles.compactKeypadText]}>{number}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={pinstyle.keypadRow}>
            <TouchableOpacity
              style={[pinstyle.keypadButton, styles.compactKeypadButton, { opacity: 0 }]}
              disabled={true}
            >
              <Text style={[pinstyle.keypadButtonText, styles.compactKeypadText]}></Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[pinstyle.keypadButton, styles.compactKeypadButton, loading && { opacity: 0.5 }]}
              onPress={() => handleKeyPress(0)}
              disabled={loading}
            >
              <Text style={[pinstyle.keypadButtonText, styles.compactKeypadText]}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[pinstyle.keypadButton, styles.compactKeypadButton, loading && { opacity: 0.5 }]}
              onPress={handleBackspace}
              disabled={loading}
            >
              <Text style={[pinstyle.keypadButtonText, styles.compactKeypadText]}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmation Button */}
        {isPinComplete() && !loading && (
          <View style={styles.compactConfirmButtonContainer}>
            <TouchableOpacity
              style={styles.compactConfirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.compactConfirmButtonText}>
                {step === 'new' ? 'Continue' : 'Set PIN'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.compactLoadingContainer}>
            <ActivityIndicator size="large" color="#303481" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  optimizedCard: {
    maxHeight: '95%',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  compactHeader: {
    marginBottom: 15,
  },
  compactTitle: {
    fontSize: 22,
    lineHeight: 26,
    marginBottom: 5,
  },
  compactSubtitle: {
    fontSize: 13,
    marginTop: 5,
  },
  compactPhoneContainer: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  compactPhoneText: {
    fontSize: 13,
    textAlign: 'center',
  },
  compactPinContainer: {
    marginBottom: 20,
    paddingHorizontal: 5,
    gap: 12,
  },
  compactPinInput: {
    width: 50,
    height: 50,
    fontSize: 20,
  },
  compactKeypadContainer: {
    flex: 0,
    paddingHorizontal: 2,
    marginBottom: 5,
  },
  compactKeypadButton: {
    minHeight: 45,
    maxHeight: 55,
  },
  compactKeypadText: {
    fontSize: 18,
  },
  compactConfirmButtonContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  compactConfirmButton: {
    backgroundColor: '#303481',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  compactLoadingContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#303481',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FirstTimePinSetup; 