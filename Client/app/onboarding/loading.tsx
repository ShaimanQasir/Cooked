import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function LoadingScreen() {
  const router = useRouter();
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Start spin animation
    rotation.value = withRepeat(
      withTiming(360, { 
        duration: 2500, 
        easing: Easing.linear 
      }),
      -1, // Infinite
      false
    );

    // Simulate recipe building, then redirect to ready page
    const timer = setTimeout(() => {
      router.replace('/onboarding/ready');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const animatedSpin = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Sparkle Circle */}
        <Animated.View style={[styles.circleOuter, animatedSpin]}>
          <View style={styles.circleInner}>
            <Ionicons name="sparkles" size={44} color={Colors.primary} />
          </View>
        </Animated.View>

        <Text style={styles.titleText}>Building your recipe profile...</Text>
        <Text style={styles.subtitleText}>This won't take long</Text>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  circleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  circleInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
