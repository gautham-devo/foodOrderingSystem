import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";

export default function LoginScreen() {
  const { colors, dark } = useTheme();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (!email.startsWith("u") || !email.endsWith("@rajagiri.edu.in")) {
      Alert.alert(
        "Error",
        "Please use your Rajagiri college email\n(u*@rajagiri.edu.in)",
      );
      return;
    }
    setLoading(true);
    const { error } = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) Alert.alert("Login Failed", error);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🍽️</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Welcome Back
          </Text>
          <Text style={[styles.heroSub, { color: colors.subtext }]}>
            Sign in to your campus canteen account
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.subtext }]}>
            College Email
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="u*@rajagiri.edu.in"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text
            style={[styles.label, { color: colors.subtext, marginTop: 14 }]}
          >
            Password
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.inputIcon}>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/signup" as any)}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: (StatusBar.currentHeight || 0) + 20 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingBottom: 40,
  },
  hero: { alignItems: "center", marginBottom: 32 },
  heroEmoji: { fontSize: 64, marginBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: "900", marginBottom: 8 },
  heroSub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  card: { borderRadius: 20, padding: 24, elevation: 2, marginBottom: 24 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: 14, fontWeight: "500", padding: 0 },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    elevation: 4,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "800" },
});
