import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import api from '../../../api/axios';
import type { ApiMessageResponse } from '../../../types';

const ResetPassword: React.FC = () => {
  const { id: rawId, token: rawToken } = useLocalSearchParams<{
    id: string | string[];
    token: string | string[];
  }>();
  const router = useRouter();

  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!id || !token) {
      setError('Invalid or missing reset link.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post<ApiMessageResponse>(
        `/auth/reset-password/${id}/${token}`,
        { newPassword: password }
      );

      if (data.success) {
        setSuccess(true);
      }
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message ||
            'An error occurred. Your link may have expired.'
        );
      } else {
        setError('An error occurred. Your link may have expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background-primary justify-center px-5"
    >
      <View className="bg-background-secondary border border-border p-7 rounded-3xl w-full max-w-md self-center overflow-hidden">
        <Text className="text-3xl font-black mb-2 uppercase text-center text-accent-primary tracking-tight">
          Reset Password
        </Text>

        {success ? (
          <View className="mt-6">
            <View className="p-4 rounded-xl bg-success/10 border border-success/30 mb-6">
              <Text className="text-success font-bold text-center text-sm">
                Your password has been successfully reset!
              </Text>
            </View>

            <Pressable
              onPress={() => router.replace('/')}
              className="w-full py-4 bg-accent-primary rounded-xl items-center active:scale-95"
            >
              <Text className="text-white font-black uppercase tracking-widest text-xs">
                Go to Login
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-4 mt-6">
            {error ? (
              <View className="p-4 rounded-xl bg-error/10 border border-error/30">
                <Text className="text-error text-sm font-bold">{error}</Text>
              </View>
            ) : null}

            <TextInput
              placeholder="New Password"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              className="w-full p-4 bg-background-primary border border-border rounded-xl text-text-primary text-base"
            />

            <TextInput
              placeholder="Confirm New Password"
              placeholderTextColor="#6b7280"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              className="w-full p-4 bg-background-primary border border-border rounded-xl text-text-primary text-base"
            />

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className={`w-full mt-2 py-4 bg-accent-primary rounded-xl items-center flex-row justify-center gap-2 active:scale-95 ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading && <ActivityIndicator size="small" color="#fff" />}
              <Text className="text-white font-black uppercase tracking-widest text-xs">
                {loading ? 'Processing...' : 'Save New Password'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ResetPassword;