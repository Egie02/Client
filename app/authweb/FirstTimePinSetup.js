import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { changePIN } from '../(services)/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#303481',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  stepDotActive: {
    backgroundColor: '#303481',
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
    alignSelf: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  numericButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  numericButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#303481',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 120,
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  backButton: {
    backgroundColor: '#6c757d',
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#303481',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    color: '#303481',
    marginTop: 10,
    fontSize: 16,
  },
  // Responsive styles
  '@media (max-width: 768px)': {
    cardContainer: {
      padding: 20,
      margin: 10,
    },
    pinInput: {
      width: 45,
      height: 45,
      fontSize: 20,
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
  '@media (max-width: 480px)': {
    container: {
      padding: 15,
    },
    cardContainer: {
      padding: 15,
    },
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
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    numericButtonText: {
      fontSize: 16,
    },
  },
});

const FirstTimePinSetup = () => {
  const [newPIN, setNewPIN] = useState(['', '', '', '']);
  const [confirmPIN, setConfirmPIN] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('new'); // 'new', 'confirm'
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
  };

  const handleKeyPress = (number) => {
    if (loading) return;

    const currentPIN = step === 'new' ? newPIN : confirmPIN;
    const setPIN = step === 'new' ? setNewPIN : setConfirmPIN;
    
    const currentIndex = currentPIN.findIndex(digit => digit === '');
    if (currentIndex !== -1 && currentIndex < 4) {
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

      const newPinString = newPIN.join('');
      const confirmPinString = confirmPIN.join('');

      if (newPinString !== confirmPinString) {
        Alert.alert('Error', 'PINs do not match');
        clearPin();
        return;
      }

      // Validate new PIN is not the same as default PIN
      if (newPinString === '1234') {
        Alert.alert('Error', 'New PIN cannot be the default PIN (1234). Please choose a different PIN.');
        setStep('new');
        setNewPIN(['', '', '', '']);
        setConfirmPIN(['', '', '', '']);
        return;
      }

      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      if (!phoneNumber) {
        Alert.alert('Error', 'Please login again');
        router.replace('/authweb/Login');
        return;
      }

      // Use the default PIN (1234) as the old PIN for first-time setup
      const response = await changePIN(phoneNumber, '1234', newPinString, true);

      if (response.success) {
        Alert.alert(
          'Success', 
          'Your PIN has been set successfully! You can now use your new PIN to login.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(web)/WebDashboard')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message);
        setStep('new');
        setNewPIN(['', '', '', '']);
        setConfirmPIN(['', '', '', '']);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
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
      ? 'Choose a secure 4-digit PIN' 
      : 'Re-enter your PIN to confirm';
  };

  const NumericButton = ({ number, onPress }) => (
    <TouchableOpacity 
      style={[styles.numericButton, loading && { opacity: 0.5 }]} 
      onPress={onPress}
      disabled={loading}
    >
      <Text style={styles.numericButtonText}>{number}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons name="shield-checkmark" size={32} color="#303481" />
          <Text style={styles.headerText}>{getStepTitle()}</Text>
          
          {loading && (
            <Text style={styles.subtitleText}>
              Setting up your PIN...
            </Text>
          )}
          
          {!loading && (
            <Text style={styles.subtitleText}>
              {getStepSubtitle()}
            </Text>
          )}
        </View>

        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'new' && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]} />
        </View>

        {step === 'confirm' && (
          <View style={{ marginBottom: 15 }}>
            <Text style={[styles.subtitleText, { fontSize: 14, color: '#28a745' }]}>
              ✓ New PIN created
            </Text>
          </View>
        )}

        <View style={styles.pinContainer}>
          {(step === 'new' ? newPIN : confirmPIN).map((digit, index) => (
            <TextInput
              key={index}
              style={[
                styles.pinInput,
                digit !== '' && styles.pinInputFilled
              ]}
              value={digit ? '•' : ''}
              onChangeText={(text) => handlePinChange(text, index)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading}
              selectTextOnFocus
            />
          ))}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#303481" />
            <Text style={styles.loadingText}>Setting up your PIN...</Text>
          </View>
        )}

        {!loading && (
          <>
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
                  style={[styles.numericButton, loading && { opacity: 0.5 }]}
                  onPress={handleBackspace}
                  disabled={loading}
                >
                  <Text style={styles.numericButtonText}>⌫</Text>
                </TouchableOpacity>
                <NumericButton number="0" onPress={() => handleKeyPress(0)} />
                <TouchableOpacity 
                  style={[styles.numericButton, loading && { opacity: 0.5 }]}
                  onPress={clearPin}
                  disabled={loading}
                >
                  <Text style={styles.numericButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonRow}>
              {step === 'confirm' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.backButton]}
                  onPress={handleBack}
                >
                  <Text style={styles.actionButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  styles.nextButton,
                  !isPinComplete() && styles.actionButtonDisabled,
                  step === 'new' && { flex: 1 }
                ]}
                onPress={handleConfirm}
                disabled={!isPinComplete()}
              >
                <Text style={styles.actionButtonText}>
                  {step === 'new' ? 'Next' : 'Set PIN'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default FirstTimePinSetup; 