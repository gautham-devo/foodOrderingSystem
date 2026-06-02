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

type Step = "credentials" | "details";

export default function SignupScreen() {
  const { colors } = useTheme();
  const { signup } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("credentials");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (!email || !password || !confirmPassword) {
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
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setStep("details");
  };

  const handleSignup = async () => {
    if (!name || !uid || !phone) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (phone.length < 10) {
      Alert.alert("Error", "Enter a valid phone number");
      return;
    }
    setLoading(true);
    const { error } = await signup(
      email.trim().toLowerCase(),
      password,
      name.trim(),
      uid.trim().toUpperCase(),
      phone.trim(),
    );
    setLoading(false);
    if (error) {
      Alert.alert("Signup Failed", error);
      setStep("credentials");
    } else {
      Alert.alert(
        "Account Created! 🎉",
        "You can now login with your credentials",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/login" as any),
          },
        ],
      );
    }
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            step === "details" ? setStep("credentials") : router.back()
          }
        >
          <Text style={[styles.backText, { color: colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>
            {step === "credentials" ? "✍️" : "👤"}
          </Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {step === "credentials" ? "Create Account" : "Your Details"}
          </Text>
          <Text style={[styles.heroSub, { color: colors.subtext }]}>
            {step === "credentials"
              ? "Step 1 of 2 — Set up your credentials"
              : "Step 2 of 2 — Tell us about yourself"}
          </Text>
        </View>

        <View style={styles.stepRow}>
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
          <View
            style={[
              styles.stepLine,
              {
                backgroundColor:
                  step === "details" ? colors.primary : colors.border,
              },
            ]}
          />
          <View
            style={[
              styles.stepDot,
              {
                backgroundColor:
                  step === "details" ? colors.primary : colors.border,
              },
            ]}
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {step === "credentials" ? (
            <>
              <Text style={[styles.label, { color: colors.subtext }]}>
                College Email
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
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
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.inputIcon}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[styles.label, { color: colors.subtext, marginTop: 14 }]}
              >
                Confirm Password
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.placeholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Text style={styles.inputIcon}>
                    {showConfirm ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={handleNext}
              >
                <Text style={styles.btnText}>Next →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.label, { color: colors.subtext }]}>
                Full Name
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Your full name"
                  placeholderTextColor={colors.placeholder}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text
                style={[styles.label, { color: colors.subtext, marginTop: 14 }]}
              >
                University ID
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={styles.inputIcon}>🎓</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g. CS21B047"
                  placeholderTextColor={colors.placeholder}
                  value={uid}
                  onChangeText={setUid}
                  autoCapitalize="characters"
                />
              </View>

              <Text
                style={[styles.label, { color: colors.subtext, marginTop: 14 }]}
              >
                Phone Number
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor={colors.placeholder}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.btn,
                  {
                    backgroundColor: colors.primary,
                    opacity: loading ? 0.7 : 1,
                  },
                ]}
                onPress={handleSignup}
                disabled={loading}
              >
                <Text style={styles.btnText}>
                  {loading ? "Creating Account..." : "Create Account 🎉"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {step === "credentials" && (
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.subtext }]}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: (StatusBar.currentHeight || 0) + 20 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  backBtn: { marginTop: 10, marginBottom: 8 },
  backText: { fontSize: 15, fontWeight: "700" },
  hero: { alignItems: "center", marginBottom: 20, marginTop: 8 },
  heroEmoji: { fontSize: 52, marginBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: "900", marginBottom: 6 },
  heroSub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepDot: { width: 12, height: 12, borderRadius: 6 },
  stepLine: { width: 60, height: 3, borderRadius: 2 },
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
