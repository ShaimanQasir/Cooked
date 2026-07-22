import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import { useToastStore } from '../../store/useToastStore';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type ResetStep = 'select' | 'email';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordReset } = useUserStore();
  const { show } = useToastStore();

  const [step, setStep] = useState<ResetStep>('select');
  const [emailVal, setEmailVal] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!emailVal.trim()) {
      setErrors({ email: 'Email address is required' });
      return;
    } else if (!/\S+@\S+\.\S+/.test(emailVal)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await requestPasswordReset(emailVal.trim());
    setLoading(false);

    if (result.success) {
      show(result.detail || 'Reset code sent to your email.', 'success');
      router.push({
        pathname: '/auth/verify-code',
        params: {
          purpose: 'forgot-password',
          email: emailVal.trim(),
        }
      });
    } else {
      show(result.error || 'Failed to send reset code. Please try again.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Back button */}
        <TouchableOpacity
          onPress={() => step === 'email' ? setStep('select') : router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={36} color={Colors.primary} />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>
            {step === 'select' ? 'Forgot Password?' : 'Check Your Email'}
          </Text>
          <Text style={styles.subtitleText}>
            {step === 'select'
              ? "No worries! Enter your email and we'll send you a reset code."
              : `We've sent a verification code to ${emailVal}`}
          </Text>
        </View>

        {step === 'select' ? (
          <>
            {/* Channel Selection */}
            <TouchableOpacity
              style={styles.channelCard}
              activeOpacity={0.8}
            >
              <View style={styles.channelIconWrapper}>
                <Ionicons name="mail-outline" size={22} color={Colors.primary} />
              </View>
              <View style={styles.channelTextWrapper}>
                <Text style={styles.channelTitle}>Email</Text>
                <Text style={styles.channelDesc}>Send reset code to your email</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
            </TouchableOpacity>

            <Button
              title="Continue"
              onPress={() => setStep('email')}
              style={styles.actionBtn}
            />
          </>
        ) : (
          <>
            {/* Email Input */}
            <View style={styles.formSection}>
              <Input
                label="Email Address"
                value={emailVal}
                onChangeText={(text) => {
                  setEmailVal(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                error={errors.email}
              />

              <Button
                title="Send Reset Code"
                onPress={handleSendCode}
                loading={loading}
                disabled={loading}
                style={styles.actionBtn}
              />
            </View>
          </>
        )}

        {/* Back to login */}
        <TouchableOpacity
          style={styles.backToLogin}
          onPress={() => router.replace('/auth/login')}
        >
          <Text style={styles.backToLoginText}>Back to Sign In</Text>
        </TouchableOpacity>

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
    marginBottom: 32,
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
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
    ...Colors.shadowSubtle,
  },
  channelIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(198, 58, 47, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelTextWrapper: {
    flex: 1,
    marginLeft: 14,
  },
  channelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  channelDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  formSection: {
    marginBottom: 8,
  },
  actionBtn: {
    marginTop: 8,
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
