import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRecipeStore, Recipe } from '../../store/useRecipeStore';
import { useUserStore } from '../../store/useUserStore';
import { useGroceryStore } from '../../store/useGroceryStore';
import { useToastStore } from '../../store/useToastStore';
import RecipeActionModal from '../../components/RecipeActionModal';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const id = Number(searchParams.id);

  const { fetchRecipeById, savedRecipes, toggleSaveRecipe, likeRecipe, dislikeRecipe, deleteRecipe, archiveRecipe, addToRecentlyViewed } = useRecipeStore();
  const { currentUserId } = useUserStore();
  const { show } = useToastStore();
  const { addRecipeIngredients } = useGroceryStore();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Steps' | 'Ingredients'>('Ingredients');
  const [actionModalVisible, setActionModalVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchRecipeById(id).then((r) => {
      setRecipe(r);
      if (r) addToRecentlyViewed(r.id);
      setLoading(false);
    });
  }, [id]);

  // Is this the current user's own recipe?
  const isOwnRecipe = recipe ? recipe.authorId === currentUserId : false;
  const isPublicRecipe = recipe ? recipe.isPublic !== false : false;

  const handleLike = async () => {
    if (!recipe) return;
    await likeRecipe(recipe.id);
    const updated = await fetchRecipeById(recipe.id);
    if (updated) setRecipe(updated);
  };

  const handleDislike = async () => {
    if (!recipe) return;
    await dislikeRecipe(recipe.id);
    const updated = await fetchRecipeById(recipe.id);
    if (updated) setRecipe(updated);
  };

  const handleArchive = async () => {
    if (!recipe) return;
    await archiveRecipe(recipe.id);
    const updated = await fetchRecipeById(recipe.id);
    if (updated) {
      setRecipe(updated);
      show(updated.isArchived ? 'Recipe archived' : 'Recipe unarchived', 'success');
    }
  };

  const handleDelete = () => {
    if (!recipe) return;
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to permanently delete "${recipe.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRecipe(recipe.id);
            show('Recipe deleted', 'success');
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({ pathname: '/recipe/edit', params: { id: String(recipe?.id) } });
  };

  const isSaved = recipe ? savedRecipes.some((s) => s.recipeId === recipe.id) : false;

  const handleAddGrocery = () => {
    if (!recipe) return;
    addRecipeIngredients(recipe.title, recipe.ingredients.map((i) => ({ name: i.name, amount: `${i.quantity} ${i.unit}` })));
    router.push('/(tabs)/grocery');
  };

  const handleAddCookbook = () => {
    router.push({
      pathname: '/cookbook/add-to-cookbook',
      params: { recipeId: String(recipe?.id) },
    });
  };

  const getIngredientEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('pasta') || lower.includes('fettuccine')) return '🍝';
    if (lower.includes('butter')) return '🧈';
    if (lower.includes('cream')) return '🥛';
    if (lower.includes('garlic')) return '🧄';
    if (lower.includes('cheese') || lower.includes('parmesan')) return '🧀';
    if (lower.includes('salt')) return '🧂';
    if (lower.includes('pepper')) return '🫑';
    if (lower.includes('water')) return '💧';
    if (lower.includes('chicken')) return '🍗';
    if (lower.includes('salmon')) return '🐟';
    if (lower.includes('egg')) return '🥚';
    if (lower.includes('onion')) return '🧅';
    if (lower.includes('tomato')) return '🍅';
    if (lower.includes('oil')) return '🫒';
    if (lower.includes('rice')) return '🍚';
    if (lower.includes('lemon')) return '🍋';
    if (lower.includes('broccoli')) return '🥦';
    if (lower.includes('carrot')) return '🥕';
    if (lower.includes('soy')) return '🥢';
    if (lower.includes('sesame')) return '🫘';
    if (lower.includes('ginger')) return '🫚';
    if (lower.includes('basil')) return '🌿';
    if (lower.includes('parsley')) return '🌿';
    return '🥕';
  };

  const steps = recipe?.instructions
    ? recipe.instructions.split(/\n|\r/).filter((s) => s.trim().length > 0)
    : [];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.errorText}>Recipe not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerRightBtns}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="share-social-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
            {isOwnRecipe && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setActionModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="ellipsis-vertical" size={22} color={Colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.imageContainer}>
          {recipe.image ? (
            <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
          ) : (
            <Skeleton height={240} borderRadius={24} icon="restaurant" />
          )}
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          {/* Allow favoriting public recipes (including user's own public recipes) */}
          {isPublicRecipe && (
            <TouchableOpacity onPress={() => toggleSaveRecipe(recipe.id)} style={styles.favoriteBtn}>
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={26}
                color={isSaved ? Colors.primary : Colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {recipe.cuisine && (
          <Text style={styles.cuisineText}>{recipe.cuisine} Cuisine</Text>
        )}

        {/* Like / Dislike Row for Public recipes (Centered) */}
        {isPublicRecipe && (
          <View style={styles.likeDislikeRow}>
            <TouchableOpacity
              style={[styles.likeDislikeBtn, recipe.isLiked && styles.likeDislikeBtnActive]}
              onPress={handleLike}
              activeOpacity={0.8}
            >
              <Ionicons
                name={recipe.isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                size={20}
                color={recipe.isLiked ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.likeDislikeText, recipe.isLiked && styles.likeDislikeTextActive]}>
                {recipe.likesCount || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.likeDislikeBtn, { marginLeft: 12 }, recipe.isDisliked && styles.likeDislikeBtnActive]}
              onPress={handleDislike}
              activeOpacity={0.8}
            >
              <Ionicons
                name={recipe.isDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
                size={20}
                color={recipe.isDisliked ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.likeDislikeText, recipe.isDisliked && styles.likeDislikeTextActive]}>
                {recipe.dislikesCount || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.likeDislikeBtn, { marginLeft: 12 }]}
              onPress={handleAddCookbook}
              activeOpacity={0.8}
            >
              <Ionicons name="bookmark-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.likeDislikeText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.metricsContainer}>
          <View style={styles.metricPill}>
            <Ionicons name="time" size={14} color="#B27A1C" />
            <Text style={styles.metricText}>{recipe.prepTime + recipe.cookTime} min</Text>
          </View>
          <View style={[styles.metricPill, { marginLeft: 8 }]}>
            <Ionicons name="flame" size={14} color="#B27A1C" />
            <Text style={styles.metricText}>{recipe.calories} kcal</Text>
          </View>
          <View style={[styles.metricPill, { marginLeft: 8 }]}>
            <Ionicons name="people" size={14} color="#B27A1C" />
            <Text style={styles.metricText}>{recipe.servings} servings</Text>
          </View>
          <View style={[styles.metricPill, { marginLeft: 8 }]}>
            <Ionicons name="bar-chart" size={14} color="#B27A1C" />
            <Text style={styles.metricText}>{recipe.difficulty}</Text>
          </View>
        </View>

        {recipe.description ? (
          <Text style={styles.descriptionText}>{recipe.description}</Text>
        ) : null}

        <View style={styles.macroContainer}>
          <View style={styles.macroPill}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{recipe.proteins}g</Text>
          </View>
          <View style={styles.macroPill}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{recipe.carbs}g</Text>
          </View>
          <View style={styles.macroPill}>
            <Text style={styles.macroLabel}>Fats</Text>
            <Text style={styles.macroValue}>{recipe.fats}g</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.addGroceryBtn}
            onPress={handleAddGrocery}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={20} color={Colors.white} style={styles.btnIcon} />
            <Text style={styles.addGroceryBtnText}>Add to Grocery</Text>
          </TouchableOpacity>
          {!isOwnRecipe && (
            <TouchableOpacity style={styles.plannerBtn} onPress={handleAddCookbook} activeOpacity={0.8}>
              <Ionicons name="bookmark-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'Steps' ? styles.tabBtnActive : null]}
            onPress={() => setActiveTab('Steps')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'Steps' ? styles.tabBtnTextActive : null]}>
              Steps
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'Ingredients' ? styles.tabBtnActive : null]}
            onPress={() => setActiveTab('Ingredients')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'Ingredients' ? styles.tabBtnTextActive : null]}>
              Ingredients ({recipe.ingredients.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Ingredients' ? (
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ing, idx) => (
              <View key={idx} style={styles.ingredientRow}>
                <View style={styles.ingLeft}>
                  <View style={styles.ingAvatar}>
                    <Text style={styles.ingEmoji}>{getIngredientEmoji(ing.name)}</Text>
                  </View>
                  <Text style={styles.ingName}>{ing.name}</Text>
                </View>
                <Text style={styles.ingAmount}>{ing.quantity} {ing.unit}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.stepsList}>
            {steps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={styles.stepNumberCircle}>
                  <Text style={styles.stepNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.stepDesc}>{step.trim()}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addCookbookBtn}
          onPress={handleAddCookbook}
          activeOpacity={0.8}
        >
          <Text style={styles.addCookbookBtnText}>Add to Cookbook</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Action Modal triggered by 3 vertical dots button */}
      {isOwnRecipe && (
        <RecipeActionModal
          visible={actionModalVisible}
          recipeTitle={recipe.title}
          isArchived={recipe.isArchived}
          onClose={() => setActionModalVisible(false)}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onDelete={handleDelete}
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
  headerRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 12,
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  backBtnText: {
    color: Colors.white,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBtn: {
    padding: 6,
  },
  imageContainer: {
    height: 240,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Colors.shadow,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
  },
  favoriteBtn: {
    padding: 6,
  },
  cuisineText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF6D9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EBD17F',
  },
  metricText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A5D11',
    marginLeft: 6,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  macroContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  macroPill: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  addGroceryBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...Colors.shadowSubtle,
  },
  btnIcon: {
    marginRight: 8,
  },
  addGroceryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  plannerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F2EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardAlt,
    height: 50,
    borderRadius: 25,
    padding: 4,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    height: '100%',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: Colors.white,
  },
  ingredientsList: {
    marginBottom: 24,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ingEmoji: {
    fontSize: 18,
  },
  ingName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  ingAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  stepsList: {
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  stepDesc: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 20,
  },
  addCookbookBtn: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...Colors.shadowSubtle,
  },
  addCookbookBtnText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  likeDislikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  likeDislikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E3E2DC',
    gap: 6,
  },
  likeDislikeBtnActive: {
    backgroundColor: '#FFF1F0',
    borderColor: Colors.primary,
  },
  likeDislikeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  likeDislikeTextActive: {
    color: Colors.primary,
  },
  ownerActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 4,
    marginBottom: 16,
    gap: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  editBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  archiveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B27A1C',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#B27A1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  deleteBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
