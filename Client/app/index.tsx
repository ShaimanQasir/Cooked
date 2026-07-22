import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/useUserStore';
import Button from '../components/Button';
import Colors from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isOnboarded } = useUserStore();

  useEffect(() => {
    // If user has already completed onboarding, route directly to Home Dashboard
    if (isOnboarded) {
      router.replace('/(tabs)/home');
    }
  }, [isOnboarded]);

  const handleGetStarted = () => {
    router.push('/onboarding/details');
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Splash Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoChar}>C</Text>
            <MaterialCommunityIcons name="pan" size={32} color={Colors.white} style={styles.panIcon} />
          </View>
          <Text style={styles.brandName}>Cooked</Text>
        </View>

        {/* Footer Details */}
        <View style={styles.footerSection}>
          <Text style={styles.welcomeTitle}>Welcome to Cooked</Text>
          <Text style={styles.welcomeSubtitle}>
            Scan ingredients. Save recipes.{"\n"}Plan effortlessly.
          </Text>

          <Button
            title="Get Started"
            onPress={handleGetStarted}
            style={styles.actionBtn}
          />
          
          <Button
            title="Sign In"
            onPress={handleSignIn}
            variant="text"
            style={styles.signInBtn}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logoChar: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.white,
    marginLeft: -4,
  },
  panIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    transform: [{ rotate: '45deg' }],
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    marginTop: 16,
    letterSpacing: -1,
  },
  footerSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  actionBtn: {
    marginBottom: 12,
  },
  signInBtn: {
    paddingVertical: 8,
  },
});
