/**
 * BiometricAuthDemo - Demonstration component showing different biometric scenarios
 * This component shows how to handle Face ID, Touch ID, and fallback scenarios
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import biometricManager from '../(services)/utils/BiometricManager';
import { AUTH_CONFIG, ERROR_MESSAGES } from '../(services)/config/security.config';

export default function BiometricAuthDemo() {
  const [biometricStatus, setBiometricStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeBiometrics();
  }, []);

  const initializeBiometrics = async () => {
    const status = await biometricManager.initialize();
    setBiometricStatus(status);
  };

  const handleBiometricAuth = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await biometricManager.authenticate();

      if (result.success) {
        Alert.alert(
          'Success!',
          'Biometric authentication successful',
          [{ text: 'OK' }]
        );
      } else {
        handleBiometricError(result);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred during biometric authentication',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricError = (result) => {
    if (result.shouldFallbackToPIN) {
      Alert.alert(
        'Authentication Failed',
        result.error + '\n\nWould you like to use PIN instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Use PIN', onPress: () => handlePinFallback() },
          ...(result.canRetry ? 
            [{ text: 'Try Again', onPress: () => handleBiometricAuth() }] : 
            []
          )
        ]
      );
    } else if (result.canRetry) {
      Alert.alert(
        'Try Again?',
        result.error,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: () => handleBiometricAuth() }
        ]
      );
    } else {
      Alert.alert(
        'Authentication Failed',
        result.error,
        [{ text: 'OK' }]
      );
    }
  };

  const handlePinFallback = () => {
    Alert.alert(
      'PIN Authentication',
      'This is where you would show the PIN input screen',
      [{ text: 'OK' }]
    );
  };

  const renderBiometricTypes = () => {
    if (!biometricStatus?.availableTypes) return null;

    return (
      <View style={styles.typesContainer}>
        <Text style={styles.typesTitle}>Available Biometric Types:</Text>
        {biometricStatus.availableTypes.map((type, index) => (
          <View key={index} style={styles.typeItem}>
            <MaterialCommunityIcons 
              name={type.icon} 
              size={20} 
              color="#303481"
            />
            <Text style={styles.typeName}>{type.name}</Text>
            <Text style={styles.typeStatus}>
              {type.available ? '✓' : '✗'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderBiometricButton = () => {
    if (!biometricStatus?.isAvailable) return null;

    const primaryType = biometricManager.getPrimaryBiometricType();
    const buttonText = primaryType 
      ? `Login with ${primaryType.name}`
      : 'Login with Biometrics';
    const iconName = primaryType?.icon || 'fingerprint';

    return (
      <TouchableOpacity
        style={[styles.biometricButton, isLoading && { opacity: 0.5 }]}
        onPress={handleBiometricAuth}
        disabled={isLoading}
      >
        <MaterialCommunityIcons 
          name={iconName} 
          size={24} 
          color="#FFFFFF"
        />
        <Text style={styles.buttonText}>
          {isLoading ? 'Authenticating...' : buttonText}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFallbackOptions = () => {
    if (biometricStatus?.isAvailable) return null;

    const reasons = [];
    if (!biometricStatus?.hasHardware) {
      reasons.push('No biometric hardware detected');
    }
    if (!biometricStatus?.isEnrolled) {
      reasons.push('No biometric authentication enrolled');
    }
    if (biometricStatus?.supportedTypes?.length === 0) {
      reasons.push('No supported biometric types');
    }

    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>Biometric Authentication Not Available</Text>
        {reasons.map((reason, index) => (
          <Text key={index} style={styles.fallbackReason}>• {reason}</Text>
        ))}
        
        {biometricStatus?.hasHardware && !biometricStatus?.isEnrolled && (
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => biometricManager.showBiometricSetupInstructions()}
          >
            <MaterialCommunityIcons 
              name="cog" 
              size={20} 
              color="#303481"
            />
            <Text style={styles.setupButtonText}>Set Up Biometrics</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.pinButton}
          onPress={handlePinFallback}
        >
          <MaterialCommunityIcons 
            name="numeric" 
            size={20} 
            color="#FFFFFF"
          />
          <Text style={styles.buttonText}>Use PIN Instead</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!biometricStatus) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Checking biometric availability...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biometric Authentication Demo</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Status:</Text>
        <Text style={styles.statusText}>
          Hardware: {biometricStatus.hasHardware ? '✓' : '✗'}
        </Text>
        <Text style={styles.statusText}>
          Enrolled: {biometricStatus.isEnrolled ? '✓' : '✗'}
        </Text>
        <Text style={styles.statusText}>
          Available: {biometricStatus.isAvailable ? '✓' : '✗'}
        </Text>
      </View>

      {renderBiometricTypes()}
      {renderBiometricButton()}
      {renderFallbackOptions()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#303481',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  typesContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typeName: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
  },
  typeStatus: {
    fontSize: 16,
    color: '#10B981',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#303481',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  fallbackContainer: {
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 10,
  },
  fallbackReason: {
    fontSize: 14,
    color: '#A16207',
    marginBottom: 5,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#303481',
  },
  setupButtonText: {
    color: '#303481',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 5,
  },
}); 