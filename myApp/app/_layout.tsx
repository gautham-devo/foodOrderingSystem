import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../context/authContext";
import { CartProvider } from "../context/cartContext";
import { ThemeProvider } from "../context/themeContext";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup =
      (segments[0] as string) === "login" ||
      (segments[0] as string) === "signup";
    if (!user && !inAuthGroup) router.replace("/login" as any);
    else if (user && inAuthGroup) router.replace("/(tabs)/" as any);
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }} />
            </AuthGate>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
