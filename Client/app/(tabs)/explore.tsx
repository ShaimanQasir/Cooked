import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore, Recipe } from '../../store/useRecipeStore';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const CUISINE_TAGS = [
  { id: 'all', label: 'All', icon: 'compass-outline' },
  { id: 'italian', label: 'Italian', icon: 'pizza-outline' },
  { id: 'japanese', label: 'Japanese', icon: 'fish-outline' },
  { id: 'mexican', label: 'Mexican', icon: 'flame-outline' },
  { id: 'chinese', label: 'Chinese', icon: 'restaurant-outline' },
  { id: 'thai', label: 'Thai', icon: 'fast-food-outline' },
  { id: 'indian', label: 'Indian', icon: 'nutrition-outline' },
  { id: 'mediterranean', label: 'Mediterranean', icon: 'leaf-outline' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const {
    recipes,
    recipesLoading,
    fetchRecipes,
    toggleSaveRecipe,
    savedRecipes,
  } = useRecipeStore();

  const [activeTag, setActiveTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecipes(true);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecipes(true);
    setRefreshing(false);
  }, []);

  const handleRecipePress = (id: number) => {
    router.push({ pathname: `/recipe/${id}`, params: { id: String(id) } });
  };

  const isSaved = (recipeId: number) => savedRecipes.some((s) => s.recipeId === recipeId);

  const filteredRecipes = recipes.filter((r) => {
    const matchesTag = activeTag === 'all' || (r.cuisine && r.cuisine.toLowerCase() === activeTag);
    const matchesSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const popularRecipes = filteredRecipes.slice(0, 10);
  const quickRecipes = recipes.filter((r) => (r.prepTime + r.cookTime) <= 25).slice(0, 6);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header Container */}
      <View style={styles.headerBox}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Explore Recipes</Text>
              <Text style={styles.headerSub}>Discover culinary ideas from around the world</Text>
            </View>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/recipe/create')}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={20} color={Colors.primary} />
              <Text style={styles.createBtnText}>Create</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="Search recipes, cuisines..."
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

          {/* Cuisine Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {CUISINE_TAGS.map((tag) => {
              const isActive = activeTag === tag.id;
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[styles.tagPill, isActive ? styles.tagPillActive : null]}
                  onPress={() => setActiveTag(tag.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={tag.icon as any}
                    size={14}
                    color={isActive ? Colors.primary : Colors.white}
                  />
                  <Text style={[styles.tagText, isActive ? styles.tagTextActive : null]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Main Recipe Grid */}
      <ScrollView
        contentContainerStyle={styles.bodyScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {recipesLoading && recipes.length === 0 ? (
          <View style={styles.loadingGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <Skeleton height={140} borderRadius={16} icon="restaurant" />
                <View style={{ marginTop: 8 }}>
                  <Skeleton height={16} borderRadius={4} width="70%" />
                  <Skeleton height={12} borderRadius={4} width="40%" style={{ marginTop: 6 }} />
                </View>
              </View>
            ))}
          </View>
        ) : popularRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="compass-outline" size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No recipes found</Text>
            <Text style={styles.emptySub}>Try adjusting your search query or cuisine filters</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionHeading}>
              {activeTag === 'all' ? 'Popular Recipes' : `${activeTag.toUpperCase()} Recipes`} ({popularRecipes.length})
            </Text>

            <View style={styles.recipeGrid}>
              {popularRecipes.map((recipe) => {
                const difficultyColor =
                  recipe.difficulty === 'easy' ? '#22C55E' :
                  recipe.difficulty === 'medium' ? '#F59E0B' : '#EF4444';

                return (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.gridCard}
                    onPress={() => handleRecipePress(recipe.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.gridImageWrapper}>
                      {recipe.image ? (
                        <Image source={{ uri: recipe.image }} style={styles.gridImage} />
                      ) : (
                        <Skeleton height={135} borderRadius={0} icon="restaurant" />
                      )}
                      <TouchableOpacity
                        style={styles.gridHeartBtn}
                        onPress={() => toggleSaveRecipe(recipe.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={isSaved(recipe.id) ? 'heart' : 'heart-outline'}
                          size={18}
                          color={isSaved(recipe.id) ? Colors.primary : Colors.white}
                        />
                      </TouchableOpacity>
                      <View style={[styles.diffBadge, { backgroundColor: difficultyColor }]}>
                        <Text style={styles.diffBadgeText}>{recipe.difficulty}</Text>
                      </View>
                    </View>

                    <View style={styles.gridCardInfo}>
                      <Text style={styles.gridTitle} numberOfLines={1}>
                        {recipe.title}
                      </Text>
                      <View style={styles.gridMetaRow}>
                        <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                        <Text style={styles.gridMetaText}>
                          {recipe.prepTime + recipe.cookTime} min
                        </Text>
                        <Text style={styles.gridDot}>·</Text>
                        <Ionicons name="thumbs-up-outline" size={12} color={Colors.textMuted} />
                        <Text style={styles.gridMetaText}>{recipe.likesCount || 0}</Text>
                      </View>
                      {recipe.cuisine ? (
                        <Text style={styles.gridCuisine}>{recipe.cuisine} Cuisine</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Meals Section */}
            {quickRecipes.length > 0 && activeTag === 'all' && !searchQuery && (
              <>
                <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Quick & Easy Meals (Under 25 mins)</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {quickRecipes.map((recipe) => (
                    <TouchableOpacity
                      key={recipe.id}
                      style={styles.quickCard}
                      onPress={() => handleRecipePress(recipe.id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.quickImageWrapper}>
                        {recipe.image ? (
                          <Image source={{ uri: recipe.image }} style={styles.quickImage} />
                        ) : (
                          <Skeleton height={90} borderRadius={0} icon="restaurant" />
                        )}
                      </View>
                      <Text style={styles.quickTitle} numberOfLines={1}>{recipe.title}</Text>
                      <View style={styles.gridMetaRow}>
                        <Ionicons name="flash-outline" size={12} color={Colors.primary} />
                        <Text style={styles.gridMetaText}>{recipe.prepTime + recipe.cookTime} min</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBox: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  tagsContainer: {
    gap: 8,
    paddingRight: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 6,
  },
  tagPillActive: {
    backgroundColor: Colors.white,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  tagTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  bodyScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  loadingGrid: {
    gap: 16,
  },
  skeletonCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  emptySub: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#1C1C1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  gridImageWrapper: {
    height: 135,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F5F4F0',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridHeartBtn: {
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
  diffBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  diffBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'capitalize',
  },
  gridCardInfo: {
    padding: 10,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  gridMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  gridMetaText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  gridDot: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  gridCuisine: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  horizontalScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  quickCard: {
    width: 130,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickImageWrapper: {
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: '#F5F4F0',
  },
  quickImage: {
    width: '100%',
    height: '100%',
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
});
