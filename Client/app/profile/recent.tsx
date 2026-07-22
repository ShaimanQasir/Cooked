import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore, Recipe } from '../../store/useRecipeStore';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function RecentRecipesScreen() {
  const router = useRouter();
  const { recentlyViewedIds, fetchRecipeById } = useRecipeStore();
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadRecent = async () => {
      if (recentlyViewedIds.length === 0) {
        setRecentRecipes([]);
        return;
      }
      setLoading(true);
      const list: Recipe[] = [];
      for (const id of recentlyViewedIds) {
        const r = await fetchRecipeById(id);
        if (r) list.push(r);
      }
      if (isMounted) {
        setRecentRecipes(list);
        setLoading(false);
      }
    };
    loadRecent();
    return () => { isMounted = false; };
  }, [recentlyViewedIds]);

  const handleRecipePress = (id: number) => {
    router.push({
      pathname: '/recipe/[id]',
      params: { id: String(id) }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recently Viewed</Text>
          <View style={styles.spacer} />
        </View>

        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading history…</Text>
          </View>
        ) : recentRecipes.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <Ionicons name="time-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No recent recipes</Text>
            <Text style={styles.emptyText}>Recipes you view will appear here so you can easily find them again.</Text>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recentRecipes.map((recipe) => (
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
                    <Skeleton width={56} height={56} borderRadius={12} icon="restaurant" />
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
                </View>

                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
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
  recentList: {
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
    width: 56,
    height: 56,
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
});
