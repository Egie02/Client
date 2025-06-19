import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import { logoutAction } from '../(redux)/authSlice';
import { blockstyle } from '../components/styles/mobilestyle';

const Blocked = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutAction());
    router.replace("/authmobile/Login");
  };

  return (
    <View style={blockstyle.container}>
      <View style={blockstyle.card}>
        <Text style={blockstyle.noteText}>Note:</Text>
        <Text style={blockstyle.messageText}>
          If your phone number is not registered in our system or if you've forgotten your password, please visit the MMPC office to resolve the issue.
        </Text>

        <TouchableOpacity
          style={blockstyle.button}
          onPress={handleLogout} 
          accessibilityRole="button"
          aria-label="Go back to login"
        >
          <Text style={blockstyle.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Blocked;
