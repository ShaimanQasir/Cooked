import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import { useToastStore } from '../../store/useToastStore';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useUserStore();
  const { show } = useToastStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await register(email.trim(), name.trim(), password);
    setLoading(false);

    if (result.success) {
      show(result.detail || 'Registration successful! Please verify your email.', 'success');
      router.push({
        pathname: '/auth/verify-code',
        params: {
          purpose: 'register',
          email: email.trim(),
          name: name.trim(),
          password: password,
        }
      });
    } else {
      show(result.error || 'Registration failed. Please try again.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="restaurant" size={32} color={Colors.white} />
          </View>
          <Text style={styles.brandName}>Cooked</Text>
          <Text style={styles.brandTagline}>Your personal recipe companion</Text>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSubtitle}>Start your culinary journey with us</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="Enter your full name"
            leftIcon="person-outline"
            error={errors.name}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="Create a password"
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
            placeholder="Confirm your password"
            secureTextEntry={true}
            leftIcon="lock-closed-outline"
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerBtn}
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtnFull} activeOpacity={0.8}>
            <FontAwesome name="google" size={20} color="#DB4437" />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Sign in link */}
        <View style={styles.signinRow}>
          <Text style={styles.signinLabel}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.signinLink}>Sign In</Text>
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
  logoSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
    marginTop: 14,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 6,
  },
  formSection: {
    marginBottom: 8,
  },
  registerBtn: {
    marginTop: 4,
    marginBottom: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textLight,
    marginHorizontal: 16,
  },
  socialRow: {
    marginBottom: 32,
  },
  socialBtnFull: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Colors.shadowSubtle,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  signinLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
