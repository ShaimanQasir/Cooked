import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import { useToastStore } from '../../store/useToastStore';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function NewPasswordScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { confirmPasswordReset } = useUserStore();
  const { show } = useToastStore();

  const email = (searchParams.email as string) || '';
  const resetToken = (searchParams.token as string) || '';
  const purpose = (searchParams.purpose as string) || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    const newErrors: Record<string, string> = {};
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await confirmPasswordReset(email, resetToken, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      show('Password updated successfully!', 'success');
      if (purpose === 'change-password') {
        const { logout } = useUserStore.getState();
        await logout();
        router.replace('/auth/password-changed');
      } else {
        router.replace('/auth/password-changed');
      }
    } else {
      show(result.error || 'Failed to update password. Please try again.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={36} color={Colors.primary} />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Create New Password</Text>
          <Text style={styles.subtitleText}>
            Your new password must be different from previously used passwords.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Input
            label="New Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="Enter new password"
            secureTextEntry={true}
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            placeholder="Confirm new password"
            secureTextEntry={true}
            leftIcon="lock-closed-outline"
            error={errors.confirmPassword}
          />

          <Button
            title="Update Password"
            onPress={handleUpdatePassword}
            loading={loading}
            disabled={loading}
            style={styles.actionBtn}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Colors.shadowSubtle,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(198, 58, 47, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(198, 58, 47, 0.12)',
  },
  titleSection: {
    marginBottom: 28,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 8,
  },
  actionBtn: {
    marginTop: 8,
  },
});
