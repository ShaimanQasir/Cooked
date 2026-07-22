import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGroceryStore } from '../../store/useGroceryStore';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface TempTag {
  name: string;
  qty: string;
}

export default function AddGroceryModal() {
  const router = useRouter();
  const { addItem } = useGroceryStore();

  const [recipeSelection, setRecipeSelection] = useState('');
  const [ingName, setIngName] = useState('');
  const [ingQty, setIngQty] = useState('');
  
  const [addedTags, setAddedTags] = useState<TempTag[]>([
    { name: 'Tomatoes', qty: '150 oz' },
    { name: 'Cheese', qty: '125 oz' }
  ]); // Pre-populated tags matching Page 44 screenshot

  const handleAddTag = () => {
    const name = ingName.trim();
    const qty = ingQty.trim();
    if (!name || !qty) return;
    
    setAddedTags([...addedTags, { name, qty }]);
    setIngName('');
    setIngQty('');
  };

  const handleRemoveTag = (index: number) => {
    setAddedTags(addedTags.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    // Add all compiled tags to the grocery store
    addedTags.forEach((tag) => {
      addItem(tag.name, tag.qty, recipeSelection || 'Custom');
    });
    
    // Add active fields if not empty
    if (ingName.trim() && ingQty.trim()) {
      addItem(ingName.trim(), ingQty.trim(), recipeSelection || 'Custom');
    }
    
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Header Row */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Grocery</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Recipe Dropdown Field */}
          <Text style={styles.inputLabel}>Recipe</Text>
          <TouchableOpacity style={styles.dropdownTrigger} activeOpacity={0.8}>
            <Text style={styles.dropdownText}>
              {recipeSelection ? recipeSelection : 'Choose a recipe'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Ingredient Details Input row (Page 44) */}
          <Text style={styles.inputLabel}>Recipe</Text>
          <View style={styles.detailsRow}>
            <TextInput
              style={styles.nameInput}
              placeholder="Cheese"
              placeholderTextColor={Colors.textLight}
              value={ingName}
              onChangeText={setIngName}
            />
            <TextInput
              style={styles.qtyInput}
              placeholder="250 kg"
              placeholderTextColor={Colors.textLight}
              value={ingQty}
              onChangeText={setIngQty}
            />
            
            {/* Plus add trigger */}
            <TouchableOpacity 
              style={styles.plusBtn}
              onPress={handleAddTag}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Ingredient Tags Display List */}
          {addedTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {addedTags.map((tag, idx) => (
                <View key={idx} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag.name} {tag.qty}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(idx)}>
                    <Ionicons name="close-circle" size={16} color="#B27A1C" style={styles.closeIcon} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Save Button */}
          <Button
            title="Save"
            onPress={handleSave}
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
    backgroundColor: Colors.primary, // Red modal backing matching Page 44 screenshot
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  closeBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 8,
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
    color: Colors.textLight,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  nameInput: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  qtyInput: {
    flex: 1.2,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  plusBtn: {
    width: 44,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF6D9', // Soft yellow pill
    borderWidth: 1,
    borderColor: '#EBD17F',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#8A5D11',
    fontWeight: '700',
    fontSize: 13,
  },
  closeIcon: {
    marginLeft: 6,
  },
  saveBtn: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
    marginTop: 8,
  },
});
