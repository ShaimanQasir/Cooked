import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRecipeStore, Recipe } from '../../store/useRecipeStore';
import { useToastStore } from '../../store/useToastStore';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function CookbookDetailsScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const id = Number(searchParams.id);
  
  const { cookbooks, fetchRecipeById, deleteCookbook, fetchCookBooks } = useRecipeStore();
  const { show } = useToastStore();

  const cookbook = cookbooks.find((cb) => cb.id === id);

  const [cookbookRecipes, setCookbookRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadRecipes = async () => {
      if (!cookbook || !cookbook.recipes || cookbook.recipes.length === 0) {
        setCookbookRecipes([]);
        return;
      }

      setLoading(true);
      const list: Recipe[] = [];
      for (const entry of cookbook.recipes) {
        const r = await fetchRecipeById(entry.recipeId);
        if (r) list.push(r);
      }

      if (isMounted) {
        setCookbookRecipes(list);
        setLoading(false);
      }
    };
    loadRecipes();
    return () => { isMounted = false; };
  }, [cookbook]);

  const handleRecipePress = (recipeId: number) => {
    router.push({
      pathname: '/recipe/[id]',
      params: { id: String(recipeId) }
    });
  };

  const handleEdit = () => {
    if (!cookbook) return;
    router.push({
      pathname: '/cookbook/edit',
      params: { id: String(cookbook.id) }
    });
  };

  const handleDeleteCookbook = () => {
    if (!cookbook) return;
    Alert.alert(
      'Delete Cookbook',
      `Are you sure you want to delete "${cookbook.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCookbook(cookbook.id);
            await fetchCookBooks();
            show('Cookbook deleted', 'success');
            router.back();
          },
        },
      ]
    );
  };

  const filteredRecipes = cookbookRecipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!cookbook) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyWrapper}>
          <Ionicons name="book-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Cookbook not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: Colors.primary, fontWeight: '700' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{cookbook.name}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.headerIconBtn} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteCookbook} style={styles.headerIconBtn} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {cookbook.description ? (
          <Text style={styles.descriptionText}>{cookbook.description}</Text>
        ) : null}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            placeholder="Search recipes in this cookbook…"
            placeholderTextColor={Colors.textLight}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* List of recipes in this cookbook */}
        {loading ? (
          <View style={styles.emptyWrapper}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading recipes…</Text>
          </View>
        ) : filteredRecipes.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching recipes found.' : 'No recipes added to this cookbook yet.'}
            </Text>
          </View>
        ) : (
          <View style={styles.recipesList}>
            {filteredRecipes.map((recipe) => (
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
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
    marginBottom: 16,
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
    marginBottom: 20,
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
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 8,
  },
  recipesList: {
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
    marginTop: 6,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
