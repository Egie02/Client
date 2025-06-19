import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Stack } from "expo-router/stack";
import { setLoading } from "./authSlice";
import { ThemeProvider } from "../../theme/ThemeManager";

function AppWrapper() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Just set loading to false, don't auto-load user data
    dispatch(setLoading(false));
  }, [dispatch]);

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" 
          options={{ title: "index", headerShown: false }} />

        <Stack.Screen name="(mobile)" 
          options={{ title: "Dashboard", headerShown: false }} />

        <Stack.Screen name="authmobile/PinInput" 
          options={{ title: "PinInput", headerShown: false }} />

        <Stack.Screen name="authmobile/Blocked" 
          options={{ title: "Blocked", headerShown: false }} /> 

        <Stack.Screen name="authmobile/Login" 
          options={{ title: "Login", headerShown: false }} />

        <Stack.Screen name="authmobile/FirstTimePinSetup" 
          options={{ title: "FirstTimePinSetup", headerShown: false }} />
          
        <Stack.Screen name="(web)" 
          options={{ title: "Dashboard", headerShown: false }} />

        <Stack.Screen name="authweb/Login" 
          options={{ title: "Login", headerShown: false }} />

        <Stack.Screen name="authweb/Blocked" 
          options={{ title: "Blocked", headerShown: false }} />

        
      

      </Stack>
    </ThemeProvider>
  );
}

export default AppWrapper;