import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert
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
  unit: string;
}

export default function AddGroceryModal() {
  const router = useRouter();
  const { addItem } = useGroceryStore();

  const [listName, setListName] = useState('Custom Items');
  const [ingName, setIngName] = useState('');
  const [ingQty, setIngQty] = useState('');
  const [ingUnit, setIngUnit] = useState('');
  
  const [addedTags, setAddedTags] = useState<TempTag[]>([]);

  const handleAddTag = () => {
    const name = ingName.trim();
    if (!name) return;
    
    setAddedTags([...addedTags, { name, qty: ingQty.trim(), unit: ingUnit.trim() }]);
    setIngName('');
    setIngQty('');
    setIngUnit('');
  };

  const handleRemoveTag = (index: number) => {
    setAddedTags(addedTags.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    const activeName = ingName.trim();
    const finalListName = listName.trim() || 'Custom Items';

    if (addedTags.length === 0 && !activeName) {
      Alert.alert('Missing Item', 'Please enter at least one item name.');
      return;
    }

    // Add queued tags
    addedTags.forEach((tag) => {
      addItem(tag.name, tag.qty, tag.unit, finalListName);
    });
    
    // Add current active inputs if not empty
    if (activeName) {
      addItem(activeName, ingQty.trim(), ingUnit.trim(), finalListName);
    }
    
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Header Row */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Grocery List</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* List Name Field */}
            <Text style={styles.inputLabel}>List Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Weekly Groceries"
              placeholderTextColor={Colors.textLight}
              value={listName}
              onChangeText={setListName}
            />

            {/* Ingredient Details Input row */}
            <Text style={styles.inputLabel}>Add Items</Text>
            <View style={styles.detailsRow}>
              <TextInput
                style={styles.nameInput}
                placeholder="Item (e.g. Cheese)"
                placeholderTextColor={Colors.textLight}
                value={ingName}
                onChangeText={setIngName}
              />
              <TextInput
                style={styles.qtyInput}
                placeholder="Qty (Optional)"
                placeholderTextColor={Colors.textLight}
                value={ingQty}
                onChangeText={setIngQty}
              />
              <TextInput
                style={styles.unitInput}
                placeholder="Unit"
                placeholderTextColor={Colors.textLight}
                value={ingUnit}
                onChangeText={setIngUnit}
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag} activeOpacity={0.8}>
                <Ionicons name="add" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Compiled Item Chips */}
            {addedTags.length > 0 && (
              <View style={styles.tagsContainer}>
                {addedTags.map((tag, idx) => (
                  <View key={idx} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>
                      {tag.name} {tag.qty ? `(${tag.qty} ${tag.unit})` : ''}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(idx)} style={{ marginLeft: 6 }}>
                      <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          <Button
            title="Save Grocery List"
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
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 2,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyInput: {
    flex: 1.2,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addTagBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagChipText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 20,
  },
});
