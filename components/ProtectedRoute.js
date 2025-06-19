import React, { useEffect } from "react";
import { View, ActivityIndicator,Platform } from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && !user) {
      if (Platform.OS === 'web') {
        router.push("/authweb/Login");
      } else {
        router.push("/authmobile/Login");
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return null; // Render nothing while redirecting
  }

  return children;
};

export default ProtectedRoute;