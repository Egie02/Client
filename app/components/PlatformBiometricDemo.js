/**
 * PlatformBiometricDemo - Demonstrates platform-specific biometric features
 * Shows the differences between Android and iOS biometric authentication
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import biometricManager from '../(services)/utils/BiometricManager';

export default function PlatformBiometricDemo() {
  const [biometricStatus, setBiometricStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeBiometrics();
  }, []);

  const initializeBiometrics = async () => {
    const status = await biometricManager.initialize();
    setBiometricStatus(status);
  };

  const handlePlatformSpecificAuth = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const primaryType = biometricManager.getPrimaryBiometricType();
      
      let authOptions = {};
      
      if (Platform.OS === 'ios') {
        // iOS-specific authentication options
        if (primaryType?.type === 'FACE_ID') {
          authOptions = {
            promptMessage: 'Use Face ID to authenticate',
            fallbackLabel: 'Use Passcode',
            disableDeviceFallback: false,
            requireConfirmation: false,
          };
        } else if (primaryType?.type === 'FINGERPRINT') {
          authOptions = {
            promptMessage: 'Use Touch ID to authenticate',
            fallbackLabel: 'Use Passcode',
            disableDeviceFallback: false,
            requireConfirmation: false,
          };
        }
      } else {
        // Android-specific authentication options
        if (primaryType?.type === 'FINGERPRINT') {
          authOptions = {
            promptMessage: 'Place your finger on the fingerprint sensor',
            fallbackLabel: 'Use PIN',
            disableDeviceFallback: false,
            requireConfirmation: true,
            cancelLabel: 'Cancel',
          };
        } else if (primaryType?.type === 'FACE_ID') {
          authOptions = {
            promptMessage: 'Look at your device to authenticate',
            fallbackLabel: 'Use PIN',
            disableDeviceFallback: false,
            requireConfirmation: true,
            cancelLabel: 'Cancel',
          };
        }
      }

      const result = await biometricManager.authenticate(authOptions);

      if (result.success) {
        Alert.alert(
          'Success!',
          `${Platform.OS === 'ios' ? 'iOS' : 'Android'} biometric authentication successful!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Biometric authentication failed: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlatformInfo = () => {
    return (
      <View style={styles.platformInfoContainer}>
        <Text style={styles.platformTitle}>
          {Platform.OS === 'ios' ? 'iOS' : 'Android'} Biometric Features
        </Text>
        
        {Platform.OS === 'ios' ? (
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Face ID with automatic prompting</Text>
            <Text style={styles.featureItem}>• Touch ID with seamless integration</Text>
            <Text style={styles.featureItem}>• iOS-native UI patterns</Text>
            <Text style={styles.featureItem}>• Keychain integration</Text>
          </View>
        ) : (
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Fingerprint scanner support</Text>
            <Text style={styles.featureItem}>• Face unlock capabilities</Text>
            <Text style={styles.featureItem}>• Material Design patterns</Text>
            <Text style={styles.featureItem}>• Manual authentication control</Text>
          </View>
        )}
      </View>
    );
  };

  const renderBiometricStatus = () => {
    if (!biometricStatus) return null;

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Biometric Status</Text>
        <Text style={styles.statusItem}>
          Available: {biometricStatus.isAvailable ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusItem}>
          Hardware: {biometricStatus.hasHardware ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusItem}>
          Enrolled: {biometricStatus.isEnrolled ? '✅' : '❌'}
        </Text>
        
        {biometricStatus.availableTypes && biometricStatus.availableTypes.length > 0 && (
          <View style={styles.typesContainer}>
            <Text style={styles.typesTitle}>Available Types:</Text>
            {biometricStatus.availableTypes.map((type, index) => (
              <View key={index} style={styles.typeItem}>
                <MaterialCommunityIcons 
                  name={type.icon} 
                  size={16} 
                  color="#303481"
                />
                <Text style={styles.typeName}>{type.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderAuthButton = () => {
    if (!biometricStatus?.isAvailable) {
      return (
        <View style={styles.unavailableContainer}>
          <Text style={styles.unavailableText}>
            Biometric authentication is not available on this device
          </Text>
        </View>
      );
    }

    const primaryType = biometricManager.getPrimaryBiometricType();
    const buttonStyle = Platform.OS === 'ios' 
      ? [styles.authButton, styles.iosButton] 
      : [styles.authButton, styles.androidButton];

    return (
      <TouchableOpacity
        style={[buttonStyle, isLoading && { opacity: 0.5 }]}
        onPress={handlePlatformSpecificAuth}
        disabled={isLoading}
      >
        <MaterialCommunityIcons 
          name={primaryType?.icon || 'fingerprint'} 
          size={24} 
          color="#FFFFFF"
        />
        <Text style={styles.authButtonText}>
          {isLoading 
            ? 'Authenticating...' 
            : `Test ${Platform.OS === 'ios' ? 'iOS' : 'Android'} Auth`
          }
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Platform Biometric Demo</Text>
      
      {renderPlatformInfo()}
      {renderBiometricStatus()}
      {renderAuthButton()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#303481',
  },
  platformInfoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  platformTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#303481',
    marginBottom: 10,
  },
  featureList: {
    marginLeft: 10,
  },
  featureItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#303481',
    marginBottom: 8,
  },
  statusItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 3,
  },
  typesContainer: {
    marginTop: 10,
  },
  typesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#303481',
    marginBottom: 5,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  typeName: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    minHeight: 40,
  },
  iosButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  androidButton: {
    backgroundColor: '#4CAF50',
    elevation: 4,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  unavailableContainer: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  unavailableText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
  },
}); 