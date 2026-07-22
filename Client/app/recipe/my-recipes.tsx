import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore, Recipe } from '../../store/useRecipeStore';
import { useUserStore } from '../../store/useUserStore';
import { useToastStore } from '../../store/useToastStore';
import RecipeActionModal from '../../components/RecipeActionModal';
import Colors from '../../constants/Colors';

type FilterTab = 'all' | 'public' | 'private' | 'archived';

function RecipeManageCard({
  recipe,
  onOpenMenu,
  onView,
}: {
  recipe: Recipe;
  onOpenMenu: () => void;
  onView: () => void;
}) {
  const difficultyColor =
    recipe.difficulty === 'easy' ? '#22C55E' :
    recipe.difficulty === 'medium' ? '#F59E0B' : '#EF4444';

  const isArchived = recipe.isArchived;
  const isPrivate = recipe.isPublic === false;

  return (
    <TouchableOpacity style={[styles.card, isArchived && styles.cardArchived]} onPress={onView} activeOpacity={0.85}>
      {/* Thumbnail */}
      <View style={styles.cardThumb}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="restaurant-outline" size={28} color={Colors.textMuted} />
          </View>
        )}
        {/* Status Badges */}
        <View style={styles.badgeContainer}>
          {isArchived ? (
            <View style={[styles.visibilityBadge, styles.visibilityBadgeArchived]}>
              <Ionicons name="archive" size={10} color={Colors.white} />
              <Text style={styles.visibilityBadgeText}>Archived</Text>
            </View>
          ) : (
            <View style={[styles.visibilityBadge, isPrivate && styles.visibilityBadgePrivate]}>
              <Ionicons
                name={isPrivate ? 'lock-closed' : 'earth'}
                size={10}
                color={Colors.white}
              />
              <Text style={styles.visibilityBadgeText}>
                {isPrivate ? 'Private' : 'Public'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, isArchived && styles.cardTitleArchived]} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.cardMeta}>
          <View style={[styles.diffBadge, { backgroundColor: difficultyColor + '20' }]}>
            <Text style={[styles.diffBadgeText, { color: difficultyColor }]}>
              {recipe.difficulty}
            </Text>
          </View>
          <Text style={styles.cardMetaText}>
            {recipe.prepTime + recipe.cookTime} min
          </Text>
          <Text style={styles.cardMetaText}>·</Text>
          <Ionicons name="thumbs-up-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.cardMetaText}>{recipe.likesCount || 0}</Text>
        </View>
        {recipe.cuisine ? (
          <Text style={styles.cardCuisine}>{recipe.cuisine}</Text>
        ) : null}
      </View>

      {/* 3 Vertical Dots Button */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={onOpenMenu}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function MyRecipesScreen() {
  const router = useRouter();
  const { recipes, fetchRecipes, deleteRecipe, archiveRecipe, recipesLoading } = useRecipeStore();
  const { currentUserId } = useUserStore();
  const { show } = useToastStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeForMenu, setSelectedRecipeForMenu] = useState<Recipe | null>(null);

  const load = useCallback(async () => {
    await fetchRecipes(true);
  }, [fetchRecipes]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      setMyRecipes(recipes.filter((r) => r.authorId === currentUserId));
    }
  }, [recipes, currentUserId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleArchiveToggle = async (recipe: Recipe) => {
    const nextState = !recipe.isArchived;
    await archiveRecipe(recipe.id);
    show(nextState ? 'Recipe archived' : 'Recipe unarchived', 'success');
  };

  const handleDelete = (recipe: Recipe) => {
    Alert.alert(
      'Delete Recipe',
      `Permanently delete "${recipe.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRecipe(recipe.id);
            show('Recipe deleted', 'success');
          },
        },
      ]
    );
  };

  const filteredRecipes = myRecipes.filter((r) => {
    if (activeFilter === 'public') return r.isPublic !== false && !r.isArchived;
    if (activeFilter === 'private') return r.isPublic === false && !r.isArchived;
    if (activeFilter === 'archived') return !!r.isArchived;
    return true; // 'all'
  });

  const totalCount = myRecipes.length;
  const publicCount = myRecipes.filter((r) => r.isPublic !== false && !r.isArchived).length;
  const privateCount = myRecipes.filter((r) => r.isPublic === false && !r.isArchived).length;
  const archivedCount = myRecipes.filter((r) => !!r.isArchived).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Recipes</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/recipe/create')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { key: 'all', label: 'All', count: totalCount },
            { key: 'public', label: 'Public', count: publicCount },
            { key: 'private', label: 'Private', count: privateCount },
            { key: 'archived', label: 'Archived', count: archivedCount },
          ].map((tab) => {
            const isSelected = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                onPress={() => setActiveFilter(tab.key as FilterTab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {recipesLoading && myRecipes.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your recipes…</Text>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>
            {activeFilter === 'all' ? 'No recipes yet' : `No ${activeFilter} recipes`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'all'
              ? 'Share your culinary creations with the world'
              : `You don't have any ${activeFilter} recipes currently.`}
          </Text>
          {activeFilter === 'all' && (
            <TouchableOpacity
              style={styles.emptyCreateBtn}
              onPress={() => router.push('/recipe/create')}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
              <Text style={styles.emptyCreateBtnText}>Create Your First Recipe</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <RecipeManageCard
              recipe={item}
              onView={() => router.push({ pathname: '/recipe/[id]', params: { id: String(item.id) } })}
              onOpenMenu={() => setSelectedRecipeForMenu(item)}
            />
          )}
        />
      )}

      {/* Action Sheet Modal triggered by 3 vertical dots */}
      {selectedRecipeForMenu && (
        <RecipeActionModal
          visible={!!selectedRecipeForMenu}
          recipeTitle={selectedRecipeForMenu.title}
          isArchived={selectedRecipeForMenu.isArchived}
          onClose={() => setSelectedRecipeForMenu(null)}
          onEdit={() =>
            router.push({
              pathname: '/recipe/edit',
              params: { id: String(selectedRecipeForMenu.id) },
            })
          }
          onArchive={() => handleArchiveToggle(selectedRecipeForMenu)}
          onDelete={() => handleDelete(selectedRecipeForMenu)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  createBtn: {
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
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  filterPillTextActive: {
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  emptyCreateBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#1C1C1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardArchived: {
    opacity: 0.75,
    backgroundColor: '#F9F9F8',
  },
  cardThumb: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F4F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  visibilityBadgePrivate: {
    backgroundColor: '#6B7280',
  },
  visibilityBadgeArchived: {
    backgroundColor: '#B27A1C',
  },
  visibilityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
  },
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
  },
  cardTitleArchived: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardMetaText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  cardCuisine: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  cardActions: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 4,
  },
  moreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
