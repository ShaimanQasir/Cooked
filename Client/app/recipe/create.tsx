import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recipeService } from '../../services/recipe.service';
import { useRecipeStore } from '../../store/useRecipeStore';
import { useToastStore } from '../../store/useToastStore';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';

interface IngredientInput {
  name: string;
  quantity: string;
  unit: string;
}

export default function CreateRecipeScreen() {
  const router = useRouter();
  const { fetchRecipes } = useRecipeStore();
  const { show } = useToastStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('2');
  const [instructions, setInstructions] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: '', quantity: '', unit: '' }
  ]);

  const handleAddIngredientField = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const handleRemoveIngredientField = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated.length > 0 ? updated : [{ name: '', quantity: '', unit: '' }]);
  };

  const handleIngredientChange = (index: number, field: keyof IngredientInput, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      show('Recipe title is required', 'error');
      return;
    }
    if (!instructions.trim()) {
      show('Cooking instructions are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const validIngredients = ingredients
        .filter((ing) => ing.name.trim())
        .map((ing) => ({
          name: ing.name.trim(),
          quantity: parseFloat(ing.quantity) || 0,
          unit: ing.unit.trim(),
        }));

      await recipeService.createRecipe({
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty,                       // already 'easy' | 'medium' | 'hard' — no conversion needed
        prep_time: parseInt(prepTime) || 0,
        cook_time: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 1,
        instructions: instructions.trim(),
        is_public: isPublic,
        cuisine_type: cuisine.trim() || undefined,   // plain string, backend resolves FK
        ingredients: validIngredients.length > 0 ? validIngredients : undefined,
      });

      show('Recipe created successfully!', 'success');
      await fetchRecipes(true);
      router.back();
    } catch (err: any) {
      const msg = err?.data
        ? Object.values(err.data).flat().join(', ')
        : (err?.message || 'Failed to create recipe');
      show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Recipe</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
          <Input
            label="Recipe Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Spaghetti Carbonara"
          />

          <Input
            label="Short Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your dish..."
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Prep Time (mins)"
                value={prepTime}
                onChangeText={setPrepTime}
                placeholder="10"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Input
                label="Cook Time (mins)"
                value={cookTime}
                onChangeText={setCookTime}
                placeholder="20"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Servings"
                value={servings}
                onChangeText={setServings}
                placeholder="2"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Input
                label="Cuisine"
                value={cuisine}
                onChangeText={setCuisine}
                placeholder="e.g. Italian"
              />
            </View>
          </View>

          {/* Difficulty Selection */}
          <Text style={styles.sectionLabel}>Difficulty</Text>
          <View style={styles.difficultyRow}>
            {(['easy', 'medium', 'hard'] as const).map((level) => {
              const isSelected = difficulty === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.diffBtn, isSelected && styles.diffBtnActive]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text style={[styles.diffBtnText, isSelected && styles.diffBtnTextActive]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ingredients Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Ingredients</Text>
            <TouchableOpacity onPress={handleAddIngredientField} style={styles.addIngBtn}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addIngBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {ingredients.map((ing, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={{ flex: 2 }}>
                <Input
                  value={ing.name}
                  onChangeText={(val) => handleIngredientChange(index, 'name', val)}
                  placeholder="Ingredient"
                  style={{ marginBottom: 0 }}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  value={ing.quantity}
                  onChangeText={(val) => handleIngredientChange(index, 'quantity', val)}
                  placeholder="Qty"
                  keyboardType="numeric"
                  style={{ marginBottom: 0 }}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  value={ing.unit}
                  onChangeText={(val) => handleIngredientChange(index, 'unit', val)}
                  placeholder="Unit (e.g. g)"
                  style={{ marginBottom: 0 }}
                />
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveIngredientField(index)}
                style={styles.deleteIngBtn}
              >
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Instructions */}
          <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Instructions</Text>
          <Input
            value={instructions}
            onChangeText={setInstructions}
            placeholder="1. Boil water..."
            style={{ height: 120 }}
            inputStyle={{ textAlignVertical: 'top', paddingVertical: 12 }}
          />

          {/* Public Toggle */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Public recipe</Text>
              <Text style={styles.toggleDesc}>Make this recipe searchable for other users</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Platform.OS === 'android' ? Colors.white : undefined}
            />
          </View>

          <Button
            title="Create Recipe"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.createButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
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
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  diffBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  diffBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF1F0',
  },
  diffBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  diffBtnTextActive: {
    color: Colors.primary,
  },
  addIngBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addIngBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  deleteIngBtn: {
    width: 40,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginVertical: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  toggleDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  createButton: {
    marginTop: 12,
  },
});
