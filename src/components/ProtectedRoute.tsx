import React, { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { Redirect, Slot } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isCheckingAuth } = useAuth();
  const { addToast } = useToast();
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (!isCheckingAuth && !isLoggedIn && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      addToast("You need to log in to access this page.", "warning");
    }
    if (isLoggedIn) {
      hasNotifiedRef.current = false;
    }
  }, [isCheckingAuth, isLoggedIn, addToast]);

  if (isCheckingAuth) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary">
        <Text className="italic text-text-muted">Verifying session...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }

  return <>{children ?? <Slot />}</>;
}

export default ProtectedRoute;