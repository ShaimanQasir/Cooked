import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Dimensions, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../../store/useRecipeStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function TypeIngredientScreen() {
  const router = useRouter();
  const { addScannedIngredient } = useRecipeStore();
  const [ingredientName, setIngredientName] = useState('');

  const handleAdd = () => {
    const name = ingredientName.trim();
    if (!name) return;
    addScannedIngredient(name);
    setIngredientName('');
    router.push('/scan/saved-ingredients');
  };

  const handleTabPress = (tabName: string) => {
    if (tabName === 'scan') {
      router.replace('/(tabs)/scan-camera');
    } else if (tabName === 'saved') {
      router.replace('/scan/saved-ingredients');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Row */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Type Ingredient</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/')} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Input area */}
        <View style={styles.formContent}>
          <Text style={styles.inputLabel}>Enter Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Garlic"
            placeholderTextColor={Colors.textLight}
            value={ingredientName}
            onChangeText={setIngredientName}
            autoFocus={true}
            onSubmitEditing={handleAdd}
          />

          {/* Suggestion Card (Page 39) */}
          {ingredientName.length > 0 && (
            <View style={styles.suggestionBox}>
              <View style={styles.suggestionLeft}>
                <Text style={styles.suggestionEmoji}>🧄</Text>
                <Text style={styles.suggestionText}>{ingredientName}</Text>
              </View>
              <Ionicons name="heart" size={20} color={Colors.primary} />
            </View>
          )}
        </View>

        {/* Bottom buttons panel */}
        <View style={styles.bottomPanel}>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>

          {/* Mode Tabs Select (Scan / Type / Saved) */}
          <View style={styles.modeTabsBg}>
            <TouchableOpacity 
              style={styles.modeTab} 
              onPress={() => handleTabPress('scan')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeTabText}>Scan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modeTabActive} activeOpacity={0.8}>
              <Text style={styles.modeTabTextActive}>Type Ingredients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modeTab} 
              onPress={() => handleTabPress('saved')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeTabText}>Saved</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  formContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
  suggestionBox: {
    height: 64,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    ...Colors.shadowSubtle,
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  bottomPanel: {
    paddingBottom: Platform.OS === 'ios' ? 16 : 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  addBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Colors.shadowSubtle,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  modeTabsBg: {
    flexDirection: 'row',
    backgroundColor: '#FAF3E0', // Cream yellow container
    height: 54,
    borderRadius: 27,
    padding: 4,
    alignItems: 'center',
    width: width - 40,
    justifyContent: 'space-between',
  },
  modeTabActive: {
    flex: 1.2,
    backgroundColor: Colors.primary,
    height: '100%',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTabTextActive: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modeTab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTabText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
