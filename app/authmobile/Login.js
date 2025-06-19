import { Platform } from 'react-native';
import React from "react";
import LoginAndroid from './LoginAndroid';
import LoginIOS from './LoginIOS';

export default function Login() {
  if (Platform.OS === 'ios') {
    return <LoginIOS />;
  } else {
    return <LoginAndroid />;
  }
}
