import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import { useRecipeStore, Recipe } from '../../store/useRecipeStore';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_CHIPS = [
  { id: 'all', label: 'All', icon: 'restaurant-outline' },
  { id: 'quick', label: 'Quick & Easy', icon: 'flash-outline' },
  { id: 'protein', label: 'High Protein', icon: 'fitness-outline' },
  { id: 'healthy', label: 'Healthy', icon: 'leaf-outline' },
  { id: 'dessert', label: 'Dessert', icon: 'ice-cream-outline' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const {
    recipes,
    savedRecipes,
    recentlyViewedIds,
    cookbooks,
    fetchRecipes,
    fetchSavedRecipes,
    fetchCookBooks,
    toggleSaveRecipe,
    addToRecentlyViewed,
  } = useRecipeStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchRecipes(true);
    fetchSavedRecipes();
    fetchCookBooks();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchRecipes(true), fetchSavedRecipes(), fetchCookBooks()]);
    setRefreshing(false);
  }, []);

  const handleRecipePress = (id: number) => {
    addToRecentlyViewed(id);
    router.push({ pathname: `/recipe/${id}`, params: { id: String(id) } });
  };

  const isSaved = (recipeId: number) => savedRecipes.some((s) => s.recipeId === recipeId);

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory === 'quick') return r.prepTime + r.cookTime <= 25;
    if (selectedCategory === 'protein') return (r.proteins || 0) >= 20;
    if (selectedCategory === 'healthy') return (r.calories || 0) <= 400;
    return true;
  });

  const recommendedRecipes = filteredRecipes.slice(0, 6);
  const recentlyViewedRecipes = recentlyViewedIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter(Boolean)
    .slice(0, 6) as Recipe[];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.profileRow}
            onPress={() => router.push('/(tabs)/profile-tab')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarWrapper}>
              <Skeleton width={44} height={44} borderRadius={22} icon="person" />
            </View>
            <View style={styles.greetingText}>
              <Text style={styles.hiText}>Hi, {profile.name || 'Chef'}</Text>
              <Text style={styles.subText}>What are we cooking today?</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRightBtns}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => router.push('/recipe/create')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search recipes, ingredients, cuisines…"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* AI Camera Hero Banner */}
        <TouchableOpacity
          style={styles.heroBanner}
          onPress={() => router.push('/(tabs)/scan-camera')}
          activeOpacity={0.88}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTag}>
              <Ionicons name="sparkles" size={12} color={Colors.primary} />
              <Text style={styles.heroTagText}>AI Ingredient Scanner</Text>
            </View>
            <Text style={styles.heroTitle}>Scan Your Pantry & Cook Instant Recipes</Text>
            <Text style={styles.heroSubtitle}>Snap a photo of your fridge ingredients to generate smart meals</Text>
            <View style={styles.heroBtn}>
              <Ionicons name="camera-outline" size={16} color={Colors.white} />
              <Text style={styles.heroBtnText}>Scan Pantry</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORY_CHIPS.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={isSelected ? Colors.white : Colors.textMuted}
                />
                <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Recommended Recipes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Recipes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.seeAllText}>Explore All</Text>
          </TouchableOpacity>
        </View>

        {recommendedRecipes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="restaurant-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyCardText}>No recipes matching your search.</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {recommendedRecipes.map((recipe) => {
              const difficultyColor =
                recipe.difficulty === 'easy' ? '#22C55E' :
                recipe.difficulty === 'medium' ? '#F59E0B' : '#EF4444';

              return (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => handleRecipePress(recipe.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.recipeImageWrapper}>
                    {recipe.image ? (
                      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                    ) : (
                      <Skeleton height={130} borderRadius={0} icon="restaurant" />
                    )}
                    <TouchableOpacity
                      style={styles.heartButton}
                      onPress={() => toggleSaveRecipe(recipe.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isSaved(recipe.id) ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isSaved(recipe.id) ? Colors.primary : Colors.white}
                      />
                    </TouchableOpacity>
                    <View style={[styles.diffTag, { backgroundColor: difficultyColor }]}>
                      <Text style={styles.diffTagText}>{recipe.difficulty}</Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.recipeTitle} numberOfLines={1}>
                      {recipe.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.metaText}>{recipe.prepTime + recipe.cookTime} min</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Ionicons name="flame-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.metaText}>{recipe.calories || 0} kcal</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewedRecipes.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Viewed</Text>
              <TouchableOpacity onPress={() => router.push('/profile/recent')}>
                <Text style={styles.seeAllText}>History</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {recentlyViewedRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.miniCard}
                  onPress={() => handleRecipePress(recipe.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.miniImageWrapper}>
                    {recipe.image ? (
                      <Image source={{ uri: recipe.image }} style={styles.miniImage} />
                    ) : (
                      <Skeleton height={85} borderRadius={0} icon="restaurant" />
                    )}
                  </View>
                  <View style={styles.miniCardBody}>
                    <Text style={styles.miniTitle} numberOfLines={1}>{recipe.title}</Text>
                    <Text style={styles.miniSub}>{recipe.prepTime + recipe.cookTime} min</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Cookbooks Highlight */}
        {cookbooks.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Cookbooks</Text>
              <TouchableOpacity onPress={() => router.push('/cookbook/list')}>
                <Text style={styles.seeAllText}>All ({cookbooks.length})</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cookbooksContainer}>
              {cookbooks.slice(0, 3).map((cb) => (
                <TouchableOpacity
                  key={cb.id}
                  style={styles.cookbookCardRow}
                  onPress={() => router.push(`/cookbook/${cb.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={styles.cookbookIconBox}>
                    <Ionicons name="book-outline" size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.cookbookInfo}>
                    <Text style={styles.cookbookName} numberOfLines={1}>{cb.name}</Text>
                    <Text style={styles.cookbookSub}>{cb.recipesCount || cb.recipes?.length || 0} recipes</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </>
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
    paddingTop: 12,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 24,
    padding: 2,
  },
  greetingText: {
    marginLeft: 12,
  },
  hiText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  subText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 1,
  },
  headerRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  heroBanner: {
    backgroundColor: '#FAF3E0',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#F3E5AB',
    marginBottom: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 24,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  heroBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryScroll: {
    gap: 8,
    marginBottom: 24,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  categoryPillTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  horizontalScroll: {
    gap: 14,
    paddingBottom: 8,
    marginBottom: 24,
  },
  recipeCard: {
    width: 175,
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#1C1C1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeImageWrapper: {
    height: 130,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F5F4F0',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diffTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  diffTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'capitalize',
  },
  cardBody: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  metaDot: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 8,
  },
  miniCard: {
    width: 120,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  miniImageWrapper: {
    height: 85,
    width: '100%',
    backgroundColor: '#F5F4F0',
  },
  miniImage: {
    width: '100%',
    height: '100%',
  },
  miniCardBody: {
    padding: 10,
  },
  miniTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  miniSub: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  cookbooksContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  cookbookCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  cookbookIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF1F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cookbookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cookbookName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  cookbookSub: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
});
