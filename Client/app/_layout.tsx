import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useUserStore } from '@/store/useUserStore';
import Toast from '@/components/Toast';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav loaded={loaded} />;
}

const AUTH_ROUTES = ['auth'];
const GUEST_ONLY_ROUTES = ['auth/login', 'auth/register', 'auth/verify-code', 'auth/forgot-password', 'auth/new-password'];

function isAuthRoute(segment: string): boolean {
  return segment === 'auth';
}

function isGuestOnlyRoute(pathname: string): boolean {
  return GUEST_ONLY_ROUTES.some(route => pathname.includes(route));
}

// Map backend onboarding_step to frontend route names
const ONBOARDING_STEP_TO_ROUTE: Record<number, string> = {
  1: 'details',       // Basic details
  2: 'language',      // Language & Region (now with country)
  3: 'find-us',       // How did you find us
  4: 'dietary',       // Dietary preferences
  5: 'allergies',     // Allergies
  6: 'dislikes',      // Disliked ingredients
  7: 'skill-level',   // Skill level
  8: 'cook-time',     // Cooking time
  9: 'cooking-frequency', // Cooking frequency
  10: 'portions',     // Cooking for / portions
  11: 'cuisines',     // Favorite cuisines
  12: 'kitchen',      // Kitchen equipment
  13: 'meal-plan-pref', // Meal planning preference
  14: 'notifications', // Notifications
  15: 'goals',        // Goals
  16: 'health-info',  // Health info
  17: 'health-info',  // Weight
  18: 'health-info',  // Height
  19: 'health-info',  // Date of birth
  20: 'health-info',  // Gender
  21: 'health-info',  // Activity level
  22: 'health-info',  // Weight goal
  23: 'ready',        // Ready page
  24: 'save-profile', // Save profile page
};

function RootLayoutNav({ loaded }: { loaded: boolean }) {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isOnboarded, onboardingStep, authChecked, checkAuth, fetchUserData, fetchProfile } = useUserStore();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, []);

  useEffect(() => {
    if (!loaded || !authChecked) return;

    const currentPath = segments.join('/');
    const inAuthGroup = isAuthRoute(segments[0] || '');

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/auth/login');
      }
    } else if (!isOnboarded) {
      const inOnboardingGroup = segments[0] === 'onboarding';
      const currentOnboardingScreen = segments[1] || '';
      const expectedRoute = ONBOARDING_STEP_TO_ROUTE[onboardingStep] || 'details';

      // If not in onboarding group, or if in onboarding but wrong step, redirect to correct step
      if (!inOnboardingGroup || currentOnboardingScreen !== expectedRoute) {
        router.replace(`/onboarding/${expectedRoute}`);
      }
    } else {
      if (inAuthGroup) {
        router.replace('/(tabs)/');
      }
    }
  }, [isAuthenticated, isOnboarded, onboardingStep, authChecked, segments, loaded]);

  if (!authChecked) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Toast />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
