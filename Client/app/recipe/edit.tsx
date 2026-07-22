import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore, Recipe } from '../../store/useRecipeStore';
import { useToastStore } from '../../store/useToastStore';
import { CreateRecipePayload } from '../../services/recipe.service';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';

interface IngredientInput {
  name: string;
  quantity: string;
  unit: string;
}

export default function EditRecipeScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const recipeId = Number(searchParams.id);

  const { recipes, fetchRecipeById, updateRecipe } = useRecipeStore();
  const { show } = useToastStore();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [instructions, setInstructions] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ name: '', quantity: '', unit: '' }]);

  // Load existing recipe data
  useEffect(() => {
    if (!recipeId) return;

    const local = recipes.find((r) => r.id === recipeId);
    if (local) {
      populate(local);
    } else {
      fetchRecipeById(recipeId).then((r) => {
        if (r) populate(r);
        setLoadingRecipe(false);
      });
      return;
    }
    setLoadingRecipe(false);
  }, [recipeId]);

  const populate = (r: Recipe) => {
    setRecipe(r);
    setTitle(r.title);
    setDescription(r.description || '');
    setDifficulty((r.difficulty || 'easy') as 'easy' | 'medium' | 'hard');
    setPrepTime(String(r.prepTime || ''));
    setCookTime(String(r.cookTime || ''));
    setServings(String(r.servings || ''));
    setInstructions(r.instructions || '');
    setCuisine(r.cuisine || '');
    setIsPublic(r.isPublic !== false);
    setIngredients(
      r.ingredients && r.ingredients.length > 0
        ? r.ingredients.map((i) => ({
            name: i.name,
            quantity: String(i.quantity),
            unit: i.unit,
          }))
        : [{ name: '', quantity: '', unit: '' }]
    );
  };

  const handleAddIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  const handleRemoveIngredient = (idx: number) => {
    const updated = ingredients.filter((_, i) => i !== idx);
    setIngredients(updated.length > 0 ? updated : [{ name: '', quantity: '', unit: '' }]);
  };
  const handleIngredientChange = (idx: number, field: keyof IngredientInput, val: string) => {
    const updated = [...ingredients];
    updated[idx][field] = val;
    setIngredients(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      show('Recipe title is required', 'error');
      return;
    }
    if (!instructions.trim()) {
      show('Instructions are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const validIngredients = ingredients
        .filter((i) => i.name.trim())
        .map((i) => ({
          name: i.name.trim(),
          quantity: parseFloat(i.quantity) || 0,
          unit: i.unit.trim(),
        }));

      const payload: CreateRecipePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty,
        prep_time: parseInt(prepTime) || 0,
        cook_time: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 1,
        instructions: instructions.trim(),
        is_public: isPublic,
        cuisine_type: cuisine.trim() || undefined,
        ingredients: validIngredients.length > 0 ? validIngredients : undefined,
      };

      await updateRecipe(recipeId, payload);
      show('Recipe updated successfully!', 'success');
      router.back();
    } catch (err: any) {
      const msg = err?.data
        ? Object.values(err.data).flat().join(', ')
        : (err?.message || 'Failed to update recipe');
      show(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingRecipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Recipe</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
          <Input label="Recipe Title" value={title} onChangeText={setTitle} placeholder="e.g. Spaghetti Carbonara" />
          <Input label="Short Description" value={description} onChangeText={setDescription} placeholder="Describe your dish…" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Prep Time (mins)" value={prepTime} onChangeText={setPrepTime} placeholder="10" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Input label="Cook Time (mins)" value={cookTime} onChangeText={setCookTime} placeholder="20" keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Servings" value={servings} onChangeText={setServings} placeholder="2" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Input label="Cuisine" value={cuisine} onChangeText={setCuisine} placeholder="e.g. Italian" />
            </View>
          </View>

          {/* Difficulty */}
          <Text style={styles.sectionLabel}>Difficulty</Text>
          <View style={styles.difficultyRow}>
            {(['easy', 'medium', 'hard'] as const).map((level) => {
              const isSelected = difficulty === level;
              const levelColor = level === 'easy' ? '#22C55E' : level === 'medium' ? '#F59E0B' : '#EF4444';
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.diffBtn, isSelected && { borderColor: levelColor, backgroundColor: levelColor + '15' }]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text style={[styles.diffBtnText, isSelected && { color: levelColor }]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ingredients */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Ingredients</Text>
            <TouchableOpacity onPress={handleAddIngredient} style={styles.addIngBtn}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addIngBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {ingredients.map((ing, idx) => (
            <View key={idx} style={styles.ingredientRow}>
              <View style={{ flex: 2 }}>
                <Input value={ing.name} onChangeText={(v) => handleIngredientChange(idx, 'name', v)} placeholder="Ingredient" style={{ marginBottom: 0 }} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input value={ing.quantity} onChangeText={(v) => handleIngredientChange(idx, 'quantity', v)} placeholder="Qty" keyboardType="numeric" style={{ marginBottom: 0 }} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input value={ing.unit} onChangeText={(v) => handleIngredientChange(idx, 'unit', v)} placeholder="Unit" style={{ marginBottom: 0 }} />
              </View>
              <TouchableOpacity onPress={() => handleRemoveIngredient(idx)} style={styles.deleteIngBtn}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Instructions */}
          <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Instructions</Text>
          <Input
            value={instructions}
            onChangeText={setInstructions}
            placeholder="1. Heat pan…"
            style={{ height: 140 }}
            inputStyle={{ textAlignVertical: 'top', paddingVertical: 12 }}
          />

          {/* Visibility Toggle */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Public recipe</Text>
              <Text style={styles.toggleDesc}>Visible to other users in Explore</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Platform.OS === 'android' ? Colors.white : undefined}
            />
          </View>

          <Button title="Save Changes" onPress={handleSave} loading={saving} disabled={saving} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  container: { padding: 20, paddingBottom: 60 },
  row: { flexDirection: 'row', width: '100%' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.textMuted, marginBottom: 8 },
  difficultyRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  diffBtn: {
    flex: 1, height: 44, borderRadius: 22, borderWidth: 1.5,
    borderColor: Colors.border, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.white,
  },
  diffBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  addIngBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addIngBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, width: '100%' },
  deleteIngBtn: { width: 40, height: 56, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, padding: 16, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.border, marginVertical: 16,
  },
  toggleLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  toggleDesc: { fontSize: 12, fontWeight: '500', color: Colors.textMuted, marginTop: 2 },
  saveBtn: { marginTop: 4 },
});
