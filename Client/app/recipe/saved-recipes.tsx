import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore, Recipe } from '../../store/useRecipeStore';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SavedRecipesListScreen() {
  const router = useRouter();
  const { savedRecipes, recipes, fetchRecipes, fetchSavedRecipes, toggleSaveRecipe, savedRecipesLoading } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSavedRecipes();
    if (recipes.length === 0) {
      fetchRecipes(true);
    }
  }, []);

  const handleRecipePress = (id: number) => {
    router.push({ pathname: `/recipe/${id}`, params: { id: String(id) } });
  };

  const savedRecipeDetails = savedRecipes
    .map((sr) => recipes.find((r) => r.id === sr.recipeId))
    .filter(Boolean) as Recipe[];

  const filtered = searchQuery
    ? savedRecipeDetails.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : savedRecipeDetails;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Recipes</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            placeholder="Search saved recipes..."
            placeholderTextColor={Colors.textLight}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {savedRecipesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <Ionicons name="heart-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No recipes match your search' : "You haven't saved any recipes yet."}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.card}
                onPress={() => handleRecipePress(recipe.id)}
                activeOpacity={0.8}
              >
                <View style={styles.imageWrapper}>
                  {recipe.image ? (
                    <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                  ) : (
                    <Skeleton height={110} borderRadius={12} icon="restaurant" />
                  )}
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={() => toggleSaveRecipe(recipe.id)}
                  >
                    <Ionicons name="heart" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text>
                <View style={styles.metricsRow}>
                  <Text style={styles.metricText}>
                    <Ionicons name="time-outline" size={12} /> {recipe.prepTime + recipe.cookTime} min
                  </Text>
                  <Text style={[styles.metricText, { marginLeft: 8 }]}>
                    <Ionicons name="flame-outline" size={12} /> {recipe.calories} kcal
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  spacer: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 24,
    ...Colors.shadowSubtle,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 20,
  },
  imageWrapper: {
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Colors.shadowSubtle,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
