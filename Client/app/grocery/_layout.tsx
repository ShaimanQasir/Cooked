import { Stack } from 'expo-router';

export default function GroceryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add-grocery-modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
