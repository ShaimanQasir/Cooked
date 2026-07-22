import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore, Recipe } from '../../store/useRecipeStore';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const router = useRouter();
  const { savedRecipes, savedRecipesLoading, fetchSavedRecipes, fetchRecipeById, toggleSaveRecipe } = useRecipeStore();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSaved = async () => {
    await fetchSavedRecipes();
  };

  useEffect(() => {
    loadSaved();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      if (savedRecipes.length === 0) {
        setFavoriteRecipes([]);
        return;
      }
      setLoadingDetails(true);
      const recipesList: Recipe[] = [];
      for (const saved of savedRecipes) {
        const r = await fetchRecipeById(saved.recipeId);
        if (r) recipesList.push(r);
      }
      if (isMounted) {
        setFavoriteRecipes(recipesList);
        setLoadingDetails(false);
      }
    };
    loadDetails();
    return () => { isMounted = false; };
  }, [savedRecipes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSaved();
    setRefreshing(false);
  };

  const handleRecipePress = (id: number) => {
    router.push({
      pathname: '/recipe/[id]',
      params: { id: String(id) }
    });
  };

  const isLoading = (savedRecipesLoading || loadingDetails) && favoriteRecipes.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Favorites</Text>
          <View style={styles.spacer} />
        </View>

        {/* Favorite recipes list */}
        {isLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading favorites…</Text>
          </View>
        ) : favoriteRecipes.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <Ionicons name="heart-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>Tap the heart on any public recipe to save it here.</Text>
          </View>
        ) : (
          <View style={styles.favoritesList}>
            {favoriteRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeRow}
                onPress={() => handleRecipePress(recipe.id)}
                activeOpacity={0.8}
              >
                <View style={styles.recipeImage}>
                  {recipe.image ? (
                    <Image source={{ uri: recipe.image }} style={styles.thumb} />
                  ) : (
                    <Skeleton width={64} height={64} borderRadius={12} icon="restaurant" />
                  )}
                </View>

                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text>
                  
                  <View style={styles.metricsRow}>
                    <Text style={styles.metricText}>
                      <Ionicons name="time-outline" size={12} /> {recipe.prepTime + recipe.cookTime} min
                    </Text>
                    <Text style={[styles.metricText, { marginLeft: 12 }]}>
                      <Ionicons name="flame-outline" size={12} /> {recipe.calories} kcal
                    </Text>
                  </View>
                  {recipe.cuisine ? (
                    <Text style={styles.cuisineText}>{recipe.cuisine}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={() => toggleSaveRecipe(recipe.id)}
                  style={styles.heartBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="heart" size={22} color={Colors.primary} />
                </TouchableOpacity>
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
    marginBottom: 24,
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
  loadingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  favoritesList: {
    marginTop: 4,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 12,
    ...Colors.shadowSubtle,
  },
  recipeImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 16,
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
  cuisineText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  heartBtn: {
    padding: 8,
  },
});
