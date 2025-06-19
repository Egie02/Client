import { Platform } from 'react-native';
import React from "react";
import PinInputAndroid from './PinInputAndroid';
import PinInputIOS from './PinInputIOS';

export default function PinInput() {
  if (Platform.OS === "ios") {
    return <PinInputIOS />;
  } else {
    return <PinInputAndroid />;
  }
}