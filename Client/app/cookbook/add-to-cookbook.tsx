import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRecipeStore } from '../../store/useRecipeStore';
import { useToastStore } from '../../store/useToastStore';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { recipeService } from '../../services/recipe.service';

export default function AddToCookbookModal() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const recipeId = Number(searchParams.recipeId);

  const { cookbooks, fetchCookBooks } = useRecipeStore();
  const { show } = useToastStore();
  const [selectedCookbookId, setSelectedCookbookId] = useState<number | null>(cookbooks[0]?.id || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedCookbook = cookbooks.find((cb) => cb.id === selectedCookbookId);

  const handleSave = async () => {
    if (!selectedCookbookId || !recipeId) {
      show('Please select a cookbook', 'error');
      return;
    }

    setLoading(true);
    try {
      const cookbook = await recipeService.getCookBook(selectedCookbookId);
      // Build the updated recipes list preserving existing ones and adding new
      const existingRecipeIds = cookbook.recipes.map((r) => r.recipe.id);
      if (existingRecipeIds.includes(recipeId)) {
        show('Recipe is already in this cookbook', 'info');
        router.back();
        return;
      }

      const updatedRecipes = [
        ...cookbook.recipes.map((r) => ({ recipe: r.recipe.id, order: r.order })),
        { recipe: recipeId, order: cookbook.recipes.length },
      ];

      await recipeService.updateCookBook(selectedCookbookId, { recipes: updatedRecipes });
      await fetchCookBooks();
      show('Recipe added to cookbook!', 'success');
      router.back();
    } catch (err: any) {
      const msg = err?.data
        ? Object.values(err.data).flat().join(', ')
        : (err?.message || 'Failed to add recipe to cookbook');
      show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>

          {/* Header Row */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to Cookbook</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={styles.modalSubtitle}>Choose a cookbook to save this recipe into</Text>

          {/* Dropdown Selector trigger */}
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>
              {selectedCookbook ? selectedCookbook.name : 'Choose a cookbook'}
            </Text>
            <Ionicons
              name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {/* Dropdown Options List */}
          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {cookbooks.length === 0 ? (
                <Text style={styles.emptyText}>No cookbooks yet. Create one first.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 180 }}>
                  {cookbooks.map((cb) => (
                    <TouchableOpacity
                      key={cb.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCookbookId(cb.id);
                        setDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{cb.name}</Text>
                      {selectedCookbookId === cb.id && (
                        <Ionicons name="checkmark" size={18} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Save Button */}
          <Button
            title={loading ? 'Saving…' : 'Save to Cookbook'}
            onPress={handleSave}
            disabled={loading || cookbooks.length === 0}
            style={styles.saveBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  closeBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 16,
  },
  dropdownTrigger: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  dropdownList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    marginBottom: 16,
  },
  dropdownItem: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.cardAlt,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  saveBtn: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
    marginTop: 8,
  },
});
