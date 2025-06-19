import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler, Alert, Image } from 'react-native';
import React, { useEffect, useState } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validatePhoneNumber } from '../(services)/api/api';

// Validation schema for phone number
const PhoneSchema = Yup.object().shape({
  PhoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
});

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
  welcomeContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeText: {
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
  errorText: {
    color: '#ff0000',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    maxWidth: 400,
    width: '100%',
  },
  countryCode: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#f0f0f0',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
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
    cardContainer: {
      padding: 15,
      margin: 10,
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
    welcomeText: {
      fontSize: 20,
    },
    subtitleText: {
      fontSize: 14,
    },
    numericButton: {
      width: 55,
      height: 55,
      borderRadius: 27.5,
    },
    numericButtonText: {
      fontSize: 18,
    },
    phoneInputContainer: {
      margin: 10,
    },
    countryCode: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 14,
    },
    input: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 14,
    },
  },
});

export default function Login() {
  const router = useRouter();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const loadFailedAttempts = async () => {
      try {
        const storedAttempts = await AsyncStorage.getItem('failedAttempts');
        if (storedAttempts) {
          const attempts = parseInt(storedAttempts);
          setFailedAttempts(attempts);
          if (attempts >= 3) {
            router.replace("/authweb/Blocked");
          }
        }
      } catch (error) {
        // Silent error handling
      }
    };
    loadFailedAttempts();
  }, []);

  const showError = (message, type = 'error') => {
    Alert.alert(
      type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Notice',
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const handlePhoneSubmit = async (values) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setValidationError(''); // Clear any existing validation errors
      
      if (!values.PhoneNumber || values.PhoneNumber.length !== 10) {
        setValidationError('Please enter a valid 10-digit phone number');
        return;
      }

      if (!/^[0-9]{10}$/.test(values.PhoneNumber)) {
        setValidationError('Phone number must contain only digits');
        return;
      }

      const fullPhoneNumber = `63${values.PhoneNumber}`;
      
      const validationResult = await validatePhoneNumber(fullPhoneNumber);
      
      if (!validationResult.isRegistered) {
        showError('This phone number is not registered in our system. Please contact support or use a registered phone number.', 'warning');
        return;
      }
      
      await AsyncStorage.setItem('tempPhone', fullPhoneNumber);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push("/authweb/PinInput");
    } catch (error) {
      // Silent error handling
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

  const handleNumericInput = (formikProps, num) => {
    if (isLoading) return;
    
    setValidationError(''); // Clear validation error when user starts typing
    const currentValue = formikProps.values.PhoneNumber;
    if (currentValue.length < 10) {
      formikProps.setFieldValue(
        "PhoneNumber",
        currentValue + num
      );
    }
  };

  const handleBackspace = (formikProps) => {
    if (isLoading) return;
    
    setValidationError(''); // Clear validation error when user starts typing
    formikProps.setFieldValue(
      "PhoneNumber",
      formikProps.values.PhoneNumber.slice(0, -1)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Login</Text>
        <Text style={styles.subtitleText}>
          Enter the last 10 digits of your phone number
        </Text>
      </View>

      <Formik
        initialValues={{ PhoneNumber: "" }}
        validationSchema={PhoneSchema}
        onSubmit={handlePhoneSubmit}
      >
        {(formikProps) => (
          <View style={styles.cardContainer}>
            {(formikProps.errors.PhoneNumber && formikProps.touched.PhoneNumber) || validationError ? (
              <Text style={styles.errorText}>
                {validationError || formikProps.errors.PhoneNumber}
              </Text>
            ) : null}
            
            <View style={styles.phoneInputContainer}>
              <Text style={styles.countryCode}>+63</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formikProps.values.PhoneNumber}
                  editable={false}
                  placeholder="XXXXXXXXXX"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
            </View>

            {formikProps.values.PhoneNumber.length > 0 && !isLoading && (
              <Text style={[
                styles.phoneText, 
                { 
                  color: formikProps.values.PhoneNumber.length === 10 ? '#28a745' : '#ffc107'
                }
              ]}>
                {formikProps.values.PhoneNumber.length}/10 digits
                {formikProps.values.PhoneNumber.length === 10 && ' ✓'}
              </Text>
            )}

            {isLoading && (
              <Text style={styles.loadingText}>
                Validating phone number...
              </Text>
            )}

            <View style={styles.keypadContainer}>
              <View style={styles.keypadRow}>
                <NumericButton number="1" onPress={() => handleNumericInput(formikProps, "1")} />
                <NumericButton number="2" onPress={() => handleNumericInput(formikProps, "2")} />
                <NumericButton number="3" onPress={() => handleNumericInput(formikProps, "3")} />
              </View>
              <View style={styles.keypadRow}>
                <NumericButton number="4" onPress={() => handleNumericInput(formikProps, "4")} />
                <NumericButton number="5" onPress={() => handleNumericInput(formikProps, "5")} />
                <NumericButton number="6" onPress={() => handleNumericInput(formikProps, "6")} />
              </View>
              <View style={styles.keypadRow}>
                <NumericButton number="7" onPress={() => handleNumericInput(formikProps, "7")} />
                <NumericButton number="8" onPress={() => handleNumericInput(formikProps, "8")} />
                <NumericButton number="9" onPress={() => handleNumericInput(formikProps, "9")} />
              </View>
              <View style={styles.keypadRow}>
                <TouchableOpacity 
                  style={[styles.numericButton, isLoading && { opacity: 0.5 }]}
                  onPress={() => handleBackspace(formikProps)}
                  disabled={isLoading}
                >
                  <Text style={styles.numericButtonText}>⌫</Text>
                </TouchableOpacity>
                <NumericButton number="0" onPress={() => handleNumericInput(formikProps, "0")} />
                <TouchableOpacity 
                  style={[
                    styles.numericButton, 
                    styles.loginButton,
                    (formikProps.values.PhoneNumber.length === 10 && formikProps.isValid && !isLoading)
                      ? {} 
                      : { opacity: 0.5 }
                  ]}
                  onPress={formikProps.handleSubmit}
                  disabled={formikProps.values.PhoneNumber.length !== 10 || !formikProps.isValid || isLoading}
                >
                  <Text style={[styles.numericButtonText, styles.loginButtonText]}>
                    {isLoading ? '...' : '➔'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
}

