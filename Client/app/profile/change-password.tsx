import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { profile, requestPasswordReset } = useUserStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleUpdate = async () => {
    const newErrors: Record<string, string> = {};
    if (!newPassword) newErrors.new = 'New password is required';
    if (newPassword.length < 6) newErrors.new = 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) newErrors.confirm = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setApiError('');
    setLoading(true);

    const result = await requestPasswordReset(profile.email);
    setLoading(false);

    if (result.success) {
      router.push({
        pathname: '/auth/verify-code',
        params: {
          purpose: 'change-password',
          email: profile.email,
        },
      });
    } else {
      setApiError(result.error || 'Failed to initiate password change. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Password</Text>
          <View style={styles.spacer} />
        </View>

        {apiError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label="New Password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.new) setErrors(prev => ({ ...prev, new: '' }));
              if (apiError) setApiError('');
            }}
            placeholder="••••••••"
            secureTextEntry={true}
            error={errors.new}
            leftIcon="lock-closed-outline"
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirm) setErrors(prev => ({ ...prev, confirm: '' }));
            }}
            placeholder="••••••••"
            secureTextEntry={true}
            error={errors.confirm}
            leftIcon="lock-closed-outline"
          />
        </View>

        <Text style={styles.infoText}>
          A verification code will be sent to {profile.email || 'your email'} to confirm this change.
        </Text>

        <Button
          title="Change Password"
          onPress={handleUpdate}
          loading={loading}
          disabled={loading}
          style={styles.actionBtn}
        />

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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  spacer: {
    width: 32,
  },
  errorBanner: {
    backgroundColor: '#FFF1F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: 8,
  },
});
