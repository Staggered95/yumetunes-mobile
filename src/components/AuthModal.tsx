import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { vars } from "nativewind";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Spinner from "@/minicomps/Spinner";

interface AuthFormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

const INITIAL_FORM: AuthFormData = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
};

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    authModalView,
    openAuthModal,
  } = useAuth();
  const { colors } = useTheme();

  const [formData, setFormData] = useState<AuthFormData>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setError("");
      setSuccessMsg("");
      setShowPassword(false);
      setFormData(INITIAL_FORM);
    }
  }, [isAuthModalOpen]);

  const handleChange = (field: keyof AuthFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (authModalView === "register") {
      if (!formData.first_name.trim() || !formData.email.trim() || !formData.username.trim()) {
        setError("Please fill in all required fields.");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
    } else if (authModalView === "login") {
      if (!formData.username.trim() || !formData.password) {
        setError("Please enter your username and password.");
        return;
      }
    } else if (authModalView === "forgot") {
      if (!formData.email.trim()) {
        setError("Please enter your email address.");
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    const endpoint =
      authModalView === "login"
        ? "/auth/login"
        : authModalView === "register"
          ? "/auth/register"
          : "/auth/forgot-password";

    try {
      const { data } = await api.post(endpoint, formData);

      if (data.success) {
        if (authModalView === "forgot") {
          setSuccessMsg(data.message || "Reset link sent to your email.");
          setFormData((prev) => ({ ...prev, email: "" }));
        } else if (data.token) {
          await login(data.token);
          closeAuthModal();
        }
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Network error. Is the server running?"
        );
      } else {
        setError("Network error. Is the server running?");
      }
    } finally {
      setLoading(false);
    }
  };

  const title =
    authModalView === "login"
      ? "Welcome Back"
      : authModalView === "register"
        ? "Join the Club"
        : "Reset Password";

  const submitLabel =
    authModalView === "login"
      ? "Log In"
      : authModalView === "register"
        ? "Sign Up"
        : "Send Reset Link";

  return (
    <Modal
      visible={isAuthModalOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeAuthModal}
    >
      <View style={vars(colors)} className="flex-1 justify-center px-4">
        {/* Backdrop */}
        <Pressable
          onPress={closeAuthModal}
          className="absolute inset-0 bg-background-primary/85"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-full max-w-md self-center"
        >
          <View
            style={{ elevation: 24 }}
            className="overflow-hidden rounded-3xl border border-border bg-background-secondary shadow-2xl"
          >
            {/* Close Button */}
            <Pressable
              onPress={closeAuthModal}
              hitSlop={10}
              className="absolute right-4 top-4 z-50 rounded-full bg-background-primary/60 p-2 active:bg-error/20"
            >
              <Feather name="x" size={20} color={colors["--txt-secondary"]} />
            </Pressable>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 28 }}
            >
              <Text className="mb-1 text-2xl font-black uppercase tracking-tighter text-text-primary">
                {title}
              </Text>

              {authModalView === "forgot" && (
                <Text className="mb-5 text-sm text-text-secondary">
                  Enter your email and we&apos;ll send you a secure link to
                  reset your password.
                </Text>
              )}

              {Boolean(error) && (
                <View className="mb-4 mt-2 rounded-xl border border-error/30 bg-error/10 p-3.5">
                  <Text className="text-sm font-bold text-error">{error}</Text>
                </View>
              )}

              {Boolean(successMsg) && (
                <View className="mb-4 mt-2 rounded-xl border border-success/30 bg-success/10 p-3.5">
                  <Text className="text-sm font-bold text-success">
                    {successMsg}
                  </Text>
                </View>
              )}

              <View className="mt-3 gap-3.5">
                {/* Registration Name Fields */}
                {authModalView === "register" && (
                  <View className="flex-row gap-3">
                    <TextInput
                      value={formData.first_name}
                      onChangeText={(v) => handleChange("first_name", v)}
                      placeholder="First Name"
                      placeholderTextColor={colors["--txt-muted"]}
                      autoCapitalize="words"
                      className="flex-1 rounded-xl border border-border bg-background-primary p-3.5 text-sm text-text-primary"
                    />
                    <TextInput
                      value={formData.last_name}
                      onChangeText={(v) => handleChange("last_name", v)}
                      placeholder="Last Name"
                      placeholderTextColor={colors["--txt-muted"]}
                      autoCapitalize="words"
                      className="flex-1 rounded-xl border border-border bg-background-primary p-3.5 text-sm text-text-primary"
                    />
                  </View>
                )}

                {/* Email Field */}
                {(authModalView === "register" ||
                  authModalView === "forgot") && (
                  <TextInput
                    value={formData.email}
                    onChangeText={(v) => handleChange("email", v)}
                    placeholder="Email Address"
                    placeholderTextColor={colors["--txt-muted"]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="w-full rounded-xl border border-border bg-background-primary p-3.5 text-sm text-text-primary"
                  />
                )}

                {/* Username & Password */}
                {authModalView !== "forgot" && (
                  <>
                    <TextInput
                      value={formData.username}
                      onChangeText={(v) => handleChange("username", v)}
                      placeholder="Username"
                      placeholderTextColor={colors["--txt-muted"]}
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="w-full rounded-xl border border-border bg-background-primary p-3.5 text-sm text-text-primary"
                    />

                    <View>
                      <View className="flex-row items-center rounded-xl border border-border bg-background-primary pr-3">
                        <TextInput
                          value={formData.password}
                          onChangeText={(v) => handleChange("password", v)}
                          placeholder="Password"
                          placeholderTextColor={colors["--txt-muted"]}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          onSubmitEditing={handleSubmit}
                          className="flex-1 p-3.5 text-sm text-text-primary"
                        />
                        <Pressable
                          onPress={() => setShowPassword((prev) => !prev)}
                          hitSlop={8}
                        >
                          <Feather
                            name={showPassword ? "eye-off" : "eye"}
                            size={18}
                            color={colors["--txt-muted"]}
                          />
                        </Pressable>
                      </View>

                      {authModalView === "login" && (
                        <Pressable
                          onPress={() => {
                            openAuthModal("forgot");
                            setError("");
                            setSuccessMsg("");
                          }}
                          className="mt-2 self-end"
                        >
                          <Text className="text-xs font-medium text-text-muted">
                            Forgot Password?
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </>
                )}

                {/* Submit Button */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={loading}
                  className={`mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-accent-primary py-4 active:opacity-85 ${
                    loading ? "opacity-60" : ""
                  }`}
                >
                  {loading && (
                    <Spinner size="sm" color={colors["--bg-primary"]} />
                  )}
                  <Text className="text-sm font-black uppercase tracking-widest text-background-primary">
                    {loading ? "Processing..." : submitLabel}
                  </Text>
                </Pressable>
              </View>

              {/* Bottom Mode Toggle */}
              <View className="mt-6 flex-row items-center justify-center">
                <Text className="text-sm text-text-secondary">
                  {authModalView === "login"
                    ? "Don't have an account?"
                    : authModalView === "register"
                      ? "Already have an account?"
                      : "Remembered your password?"}
                </Text>
                <Pressable
                  onPress={() => {
                    openAuthModal(
                      authModalView === "login" ? "register" : "login"
                    );
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="ml-2"
                >
                  <Text className="text-sm font-bold text-accent-tertiary">
                    {authModalView === "login" ? "Sign Up" : "Log In"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}