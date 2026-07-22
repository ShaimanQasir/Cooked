import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore, Recipe } from '../../store/useRecipeStore';
import { useUserStore } from '../../store/useUserStore';
import { useToastStore } from '../../store/useToastStore';
import { recipeService } from '../../services/recipe.service';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function AddCookbookScreen() {
  const router = useRouter();
  const { recipes, fetchRecipes, savedRecipes, fetchSavedRecipes, fetchCookBooks } = useRecipeStore();
  const { currentUserId } = useUserStore();
  const { show } = useToastStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);
  const [showAddList, setShowAddList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecipes(true);
    fetchSavedRecipes();
  }, []);

  // Eligible recipes: User's own recipes (public or private) + Public recipes saved by user
  const savedRecipeIds = savedRecipes.map((s) => s.recipeId);
  const availableRecipes = recipes.filter(
    (r) => r.authorId === currentUserId || (r.isPublic !== false && savedRecipeIds.includes(r.id))
  );

  const selectedRecipes = availableRecipes.filter((r) => selectedRecipeIds.includes(r.id));
  const unselectedRecipes = availableRecipes.filter((r) => !selectedRecipeIds.includes(r.id));

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      show('Cookbook name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: trimmedName,
        description: description.trim() || `Cookbook with ${selectedRecipeIds.length} recipes`,
        recipes: selectedRecipeIds.map((recipeId, index) => ({
          recipe: recipeId,
          order: index,
        })),
      };

      await recipeService.createCookBook(payload);
      await fetchCookBooks();
      show('Cookbook created successfully!', 'success');
      router.back();
    } catch (err: any) {
      const msg = err?.data
        ? Object.values(err.data).flat().join(', ')
        : (err?.message || 'Failed to create cookbook');
      show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = (id: number) => {
    setSelectedRecipeIds(selectedRecipeIds.filter((rId) => rId !== id));
  };

  const handleAddRecipeToList = (id: number) => {
    if (!selectedRecipeIds.includes(id)) {
      setSelectedRecipeIds([...selectedRecipeIds, id]);
    }
    setShowAddList(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Add Cookbook</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Name input */}
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Italian Favorites"
          placeholderTextColor={Colors.textLight}
          value={name}
          onChangeText={setName}
        />

        {/* Description input */}
        <Text style={styles.inputLabel}>Description (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe your cookbook…"
          placeholderTextColor={Colors.textLight}
          value={description}
          onChangeText={setDescription}
        />

        {/* Recipes Subtitle */}
        <Text style={styles.recipesSectionTitle}>Recipes ({selectedRecipes.length})</Text>

        {/* Recipes List (Grid) */}
        <View style={styles.recipesListGrid}>
          {selectedRecipes.map((recipe) => (
            <View key={recipe.id} style={styles.recipeCard}>
              <View style={styles.imageWrapper}>
                {recipe.image ? (
                  <Image source={{ uri: recipe.image }} style={styles.cardImage} />
                ) : (
                  <Skeleton height={110} borderRadius={12} icon="restaurant" />
                )}
                
                {/* Delete overlay */}
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteRecipe(recipe.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash" size={16} color={Colors.primary} />
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
            </View>
          ))}

          {/* Plus Add button */}
          <TouchableOpacity 
            style={styles.addRecipeCardBtn}
            onPress={() => setShowAddList(!showAddList)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={32} color={Colors.textLight} />
            <Text style={styles.addRecipeText}>Add Recipe</Text>
          </TouchableOpacity>
        </View>

        {/* Recipe Selection Options */}
        {showAddList && (
          <View style={styles.selectorDropdown}>
            <Text style={styles.selectorTitle}>Select a recipe to add:</Text>
            {unselectedRecipes.length === 0 ? (
              <Text style={styles.emptySelectorText}>
                No more eligible recipes available. Create or favorite recipes first!
              </Text>
            ) : (
              unselectedRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.selectorItem}
                  onPress={() => handleAddRecipeToList(recipe.id)}
                >
                  <View style={styles.selectorItemLeft}>
                    {recipe.image ? (
                      <Image source={{ uri: recipe.image }} style={styles.selectorThumb} />
                    ) : (
                      <Ionicons name="restaurant-outline" size={20} color={Colors.textMuted} />
                    )}
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.selectorItemText}>{recipe.title}</Text>
                      <Text style={styles.selectorSubText}>
                        {recipe.authorId === currentUserId ? (recipe.isPublic !== false ? 'Your Public Recipe' : 'Your Private Recipe') : 'Saved Public Recipe'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Save Button */}
        <Button
          title="Save Cookbook"
          onPress={handleSave}
          disabled={!name.trim() || loading}
          loading={loading}
          style={styles.saveBtn}
        />

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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  textInput: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 16,
  },
  recipesSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  recipesListGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  recipeCard: {
    width: '48%',
    marginRight: '4%',
    marginBottom: 16,
  },
  imageWrapper: {
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF1F0',
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
  addRecipeCardBtn: {
    width: '48%',
    height: 110,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.card,
  },
  addRecipeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 4,
  },
  selectorDropdown: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  emptySelectorText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  selectorItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  selectorItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  selectorSubText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 1,
  },
  saveBtn: {
    marginTop: 12,
  },
});
