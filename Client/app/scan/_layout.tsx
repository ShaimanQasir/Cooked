import { Stack } from 'expo-router';

export default function ScanLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="saved-ingredients" />
      <Stack.Screen name="type-ingredient" />
      <Stack.Screen name="recipes-cook-now" />
    </Stack>
  );
}
