import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="details" />
      <Stack.Screen name="language" />
      <Stack.Screen name="find-us" />
      <Stack.Screen name="dietary" />
      <Stack.Screen name="allergies" />
      <Stack.Screen name="dislikes" />
      <Stack.Screen name="skill-level" />
      <Stack.Screen name="cook-time" />
      <Stack.Screen name="cooking-frequency" />
      <Stack.Screen name="portions" />
      <Stack.Screen name="cuisines" />
      <Stack.Screen name="kitchen" />
      <Stack.Screen name="meal-plan-pref" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="health-info" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="ready" />
      <Stack.Screen name="save-profile" />
      <Stack.Screen name="generating-recipes" />
      <Stack.Screen name="trial" />
      <Stack.Screen name="flavor-dna" />
    </Stack>
  );
}
