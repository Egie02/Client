/**
 * First-Time PIN Change Example
 * Demonstrates various secure ways to trigger first-time PIN changes
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  triggerNewUserPinChange,
  triggerDefaultPinChange,
  triggerAdminPinChange,
  triggerSecurityBreachPinChange,
  manualTriggerFirstTimePin,
  validateFirstTimePinQualification
} from '../app/(services)/utils/FirstTimePinTrigger';

const FirstTimePinExample = () => {
  const [phoneNumber, setPhoneNumber] = useState('1234567890');
  const [platform, setPlatform] = useState('mobile'); // 'mobile' or 'web'
  const router = useRouter();

  // Example 1: Trigger for new user
  const handleNewUserTrigger = async () => {
    const success = await triggerNewUserPinChange(phoneNumber, router, platform);
    if (success) {
      console.log('New user PIN change triggered successfully');
    } else {
      Alert.alert('Error', 'Failed to trigger new user PIN change');
    }
  };

  // Example 2: Trigger when default PIN detected
  const handleDefaultPinTrigger = async () => {
    const success = await triggerDefaultPinChange(phoneNumber, router, platform);
    if (success) {
      console.log('Default PIN change triggered successfully');
    } else {
      Alert.alert('Info', 'Default PIN change not required for this user');
    }
  };

  // Example 3: Administrative trigger
  const handleAdminTrigger = async () => {
    const success = await triggerAdminPinChange(
      phoneNumber, 
      router, 
      platform, 
      'Company security policy update - all users must update PINs'
    );
    if (success) {
      console.log('Admin PIN change triggered successfully');
    } else {
      Alert.alert('Error', 'Failed to trigger admin PIN change');
    }
  };

  // Example 4: Security breach response
  const handleSecurityBreachTrigger = async () => {
    const success = await triggerSecurityBreachPinChange(phoneNumber, router, platform);
    if (success) {
      console.log('Security breach PIN change triggered successfully');
    } else {
      Alert.alert('Error', 'Failed to trigger security breach PIN change');
    }
  };

  // Example 5: Manual/programmatic trigger
  const handleManualTrigger = async () => {
    const result = await manualTriggerFirstTimePin(phoneNumber, {
      reason: 'Manual trigger from admin panel',
      requireImmediate: true,
      customMessage: 'Your administrator has requested that you update your PIN for enhanced security.'
    });

    if (result.success) {
      console.log('Manual trigger successful:', result);
      Alert.alert(
        'Success',
        `PIN change triggered. Use route: ${platform === 'mobile' ? result.mobileRoute : result.webRoute}`
      );
    } else {
      Alert.alert('Error', `Failed to trigger: ${result.error}`);
    }
  };

  // Example 6: Validate user qualification
  const handleValidateQualification = async () => {
    const qualification = await validateFirstTimePinQualification(phoneNumber, '1234');
    
    Alert.alert(
      'Qualification Check',
      `Qualifies: ${qualification.qualifies}\n` +
      `Is Default PIN: ${qualification.isDefaultPin}\n` +
      `Has OTCPIN Access: ${qualification.hasOtcpinAccess}\n` +
      `Already Completed: ${qualification.alreadyCompleted}\n\n` +
      `Recommendation: ${qualification.recommendation}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>First-Time PIN Change Examples</Text>
      
      <Text style={styles.subtitle}>Configuration</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      
      <View style={styles.platformSelector}>
        <TouchableOpacity
          style={[styles.platformButton, platform === 'mobile' && styles.platformButtonActive]}
          onPress={() => setPlatform('mobile')}
        >
          <Text style={[styles.platformButtonText, platform === 'mobile' && styles.platformButtonTextActive]}>
            Mobile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.platformButton, platform === 'web' && styles.platformButtonActive]}
          onPress={() => setPlatform('web')}
        >
          <Text style={[styles.platformButtonText, platform === 'web' && styles.platformButtonTextActive]}>
            Web
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Trigger Examples</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleNewUserTrigger}>
        <Text style={styles.buttonText}>1. New User Trigger</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleDefaultPinTrigger}>
        <Text style={styles.buttonText}>2. Default PIN Trigger</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAdminTrigger}>
        <Text style={styles.buttonText}>3. Admin Policy Trigger</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSecurityBreachTrigger}>
        <Text style={styles.buttonText}>4. Security Breach Trigger</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleManualTrigger}>
        <Text style={styles.buttonText}>5. Manual/Programmatic Trigger</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.validateButton]} onPress={handleValidateQualification}>
        <Text style={styles.buttonText}>6. Validate User Qualification</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Security Features:</Text>
        <Text style={styles.infoText}>• Default PIN "1234" detection</Text>
        <Text style={styles.infoText}>• OTCPIN access validation</Text>
        <Text style={styles.infoText}>• Failed attempt tracking</Text>
        <Text style={styles.infoText}>• Temporary lockout protection</Text>
        <Text style={styles.infoText}>• Secure storage management</Text>
        <Text style={styles.infoText}>• Platform-specific routing</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#303481',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  platformSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  platformButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  platformButtonActive: {
    backgroundColor: '#303481',
    borderColor: '#303481',
  },
  platformButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  platformButtonTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#303481',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  validateButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#303481',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#303481',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});

export default FirstTimePinExample; 