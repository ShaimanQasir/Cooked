import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function PasswordChangedScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>

        {/* Top Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoSmall}>
            <Ionicons name="restaurant" size={18} color={Colors.white} />
          </View>
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          {/* Success Icon */}
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Ionicons name="checkmark" size={40} color={Colors.success} />
            </View>
            {/* Decorative dots */}
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
            <View style={[styles.dot, styles.dot4]} />
          </View>

          <Text style={styles.titleText}>All Done!</Text>
          <Text style={styles.statusText}>Password Changed</Text>
          <Text style={styles.subtitleText}>
            Your password has been updated successfully. You can now sign in with your new password.
          </Text>
        </View>

        {/* Action */}
        <Button
          title="Back to Sign In"
          onPress={handleGetStarted}
          style={styles.actionBtn}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 36,
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  logoSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconOuter: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconInner: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(43, 130, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(43, 130, 85, 0.15)',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    opacity: 0.4,
  },
  dot1: { top: 0, left: 20 },
  dot2: { top: 10, right: 0 },
  dot3: { bottom: 10, left: 0 },
  dot4: { bottom: 0, right: 20 },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  actionBtn: {
    marginBottom: 16,
  },
});
