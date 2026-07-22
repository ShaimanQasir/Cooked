import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { verifyOtp, resendOtp, login, verifyPasswordResetOtp } = useUserStore();

  const purpose = searchParams.purpose as string;
  const email = (searchParams.email as string) || '';
  const password = (searchParams.password as string) || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOtpChange = (value: string, index: number) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    setApiError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      setApiError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setApiError('');

    if (purpose === 'forgot-password' || purpose === 'change-password') {
      const result = await verifyPasswordResetOtp(email, enteredCode);
      setLoading(false);

      if (result.success && result.resetToken) {
        router.replace({
          pathname: '/auth/new-password',
          params: { email, token: result.resetToken, purpose: purpose || 'forgot-password' },
        });
      } else {
        setApiError(result.error || 'Verification failed. Please try again.');
      }
    } else if (purpose === 'register') {
      const result = await verifyOtp(email, enteredCode);
      setLoading(false);

      if (result.success) {
        setLoading(true);
        const loginResult = await login(email, password);
        setLoading(false);

        if (loginResult.success) {
          router.replace('/(tabs)/explore');
        } else {
          setSuccessMessage('Email verified! Please login with your credentials.');
          setTimeout(() => {
            router.replace('/auth/login');
          }, 2000);
        }
      } else {
        setApiError(result.error || 'Verification failed. Please try again.');
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    setApiError('');
    setSuccessMessage('');

    const result = await resendOtp(email);
    setResending(false);

    if (result.success) {
      setSuccessMessage('A new code has been sent to your email.');
    } else {
      setApiError(result.error || 'Failed to resend code. Please try again.');
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
            <Ionicons name="shield-checkmark-outline" size={36} color={Colors.primary} />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Verification Code</Text>
          <Text style={styles.subtitleText}>
            Enter the 6-digit code we sent to{'\n'}{email || 'your email'}
          </Text>
        </View>

        {/* Banners */}
        {apiError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
            <Text style={styles.successBannerText}>{successMessage}</Text>
          </View>
        ) : null}

        {/* OTP Input */}
        <View style={styles.otpRow}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => { inputRefs.current[idx] = ref; }}
              style={[styles.otpBox, apiError ? styles.otpBoxError : null]}
              value={otp[idx]}
              onChangeText={(val) => handleOtpChange(val.replace(/[^0-9]/g, ''), idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus={true}
            />
          ))}
        </View>

        {/* Verify Button */}
        <Button
          title={purpose === 'forgot-password' || purpose === 'change-password' ? 'Continue' : 'Verify'}
          onPress={handleVerify}
          loading={loading}
          disabled={loading}
          style={styles.verifyBtn}
        />

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive a code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={[styles.resendLink, resending ? { opacity: 0.5 } : null]}>
              {resending ? 'Sending...' : 'Resend Code'}
            </Text>
          </TouchableOpacity>
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 62, 53, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(209, 62, 53, 0.12)',
  },
  errorBannerText: {
    flex: 1,
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 130, 85, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(43, 130, 85, 0.12)',
  },
  successBannerText: {
    flex: 1,
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  otpBox: {
    width: '14%',
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  otpBoxError: {
    borderColor: Colors.error,
  },
  verifyBtn: {
    marginBottom: 20,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
});
