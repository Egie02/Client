import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import { logoutAction } from '../(redux)/authSlice';
import { webBlockstyle } from '../components/webstyle';

const webBlocked = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutAction());
    router.replace("/authweb/Login");
  };

  return (
    <View style={webBlockstyle.container}>
      <View style={webBlockstyle.card}>
        <Text style={webBlockstyle.noteText}>Note:</Text>
        <Text style={webBlockstyle.messageText}>
          If your phone number is not registered in our system or if you've forgotten your password, please visit the MMPC office to resolve the issue.
        </Text>

        <TouchableOpacity
          style={webBlockstyle.button}
          onPress={handleLogout} 
          accessibilityRole="button"
          aria-label="Go back to login"
        >
          <Text style={webBlockstyle.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default webBlocked;
