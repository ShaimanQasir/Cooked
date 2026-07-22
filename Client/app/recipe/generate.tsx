import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { recipeService } from '../../services/recipe.service';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const SUGGESTIONS = [
  'Quick vegetarian dinner',
  'Healthy breakfast under 300 calories',
  'Spicy Thai chicken curry',
  'Pasta with homemade pesto',
  'High protein meal prep for the week',
  'Gluten-free chocolate dessert',
];

export default function GenerateRecipeScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await recipeService.generateRecipes(trimmed);
      const recipes = Array.isArray(res) ? res : (res as any).recipes || [];
      setResults(recipes);
      if (recipes.length === 0) {
        setError('No recipes found. Try a different prompt.');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to generate recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (text: string) => {
    setPrompt(text);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Recipes</Text>
          <View style={styles.spacer} />
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <View style={styles.descriptionIcon}>
            <Ionicons name="sparkles" size={24} color={Colors.info} />
          </View>
          <View style={styles.descriptionText}>
            <Text style={styles.descriptionTitle}>What are you craving?</Text>
            <Text style={styles.descriptionSubtitle}>
              Describe what you want and AI will generate custom recipes for you
            </Text>
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Quick healthy dinner with chicken..."
            placeholderTextColor={Colors.textLight}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {prompt.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setPrompt('')}
            >
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateBtn, (!prompt.trim() || loading) && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!prompt.trim() || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={Colors.white} size="small" />
              <Text style={styles.generateBtnText}>Generating...</Text>
            </View>
          ) : (
            <View style={styles.loadingRow}>
              <Ionicons name="sparkles" size={20} color={Colors.white} />
              <Text style={styles.generateBtnText}>Generate Recipes</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Suggestions */}
        {results.length === 0 && !loading && (
          <>
            <Text style={styles.sectionTitle}>Try these ideas</Text>
            <View style={styles.suggestionsGrid}>
              {SUGGESTIONS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(s)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="bulb-outline" size={14} color={Colors.info} />
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Error */}
        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Results */}
        {results.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Generated Recipes</Text>
            {results.map((recipe: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.resultCard}
                activeOpacity={0.8}
              >
                <View style={styles.resultHeader}>
                  <View style={styles.resultIcon}>
                    <Ionicons name="restaurant-outline" size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                      {recipe.title || `Recipe ${index + 1}`}
                    </Text>
                    <Text style={styles.resultMeta}>
                      {recipe.prep_time || recipe.cook_time
                        ? `${(recipe.prep_time || 0) + (recipe.cook_time || 0)} min`
                        : 'Quick'}
                      {recipe.calories ? ` · ${recipe.calories} kcal` : ''}
                    </Text>
                  </View>
                </View>
                {recipe.description && (
                  <Text style={styles.resultDescription} numberOfLines={2}>
                    {recipe.description}
                  </Text>
                )}
                {recipe.ingredients && (
                  <View style={styles.ingredientTags}>
                    {(Array.isArray(recipe.ingredients) ? recipe.ingredients.slice(0, 4) : []).map(
                      (ing: any, i: number) => (
                        <View key={i} style={styles.ingredientTag}>
                          <Text style={styles.ingredientTagText}>
                            {typeof ing === 'string' ? ing : ing.name || ing.ingredient || ''}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  descriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 130, 181, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(60, 130, 181, 0.15)',
  },
  descriptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(60, 130, 181, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionText: {
    flex: 1,
    marginLeft: 14,
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  descriptionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    minHeight: 100,
    position: 'relative',
    ...Colors.shadowSubtle,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 22,
    paddingRight: 30,
  },
  clearBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  generateBtn: {
    height: 54,
    backgroundColor: Colors.info,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: Colors.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  generateBtnDisabled: {
    backgroundColor: Colors.textLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    ...Colors.shadowSubtle,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 62, 53, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(209, 62, 53, 0.15)',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    ...Colors.shadowSubtle,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(198, 58, 47, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  resultMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  resultDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 10,
    lineHeight: 18,
  },
  ingredientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  ingredientTag: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ingredientTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
