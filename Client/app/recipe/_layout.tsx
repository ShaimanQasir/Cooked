import { Stack } from 'expo-router';

export default function RecipeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="create" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="my-recipes" />
      <Stack.Screen name="saved-recipes" />
      <Stack.Screen name="generate" />
      <Stack.Screen name="recently-viewed" />
    </Stack>
  );
}
