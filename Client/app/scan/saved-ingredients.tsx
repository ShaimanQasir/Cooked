import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../../store/useRecipeStore';
import { usePantryStore } from '../../store/usePantryStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SavedIngredientsScreen() {
  const router = useRouter();
  const { scannedIngredients, removeScannedIngredient } = useRecipeStore();
  const { items: pantryItems, fetchPantryItems, removePantryItem } = usePantryStore();

  React.useEffect(() => {
    fetchPantryItems();
  }, []);

  const handleAdd = () => {
    // Navigate to Recipes You Can Cook Now (Page 41)
    router.push('/scan/recipes-cook-now');
  };

  const handleTabPress = (tabName: string) => {
    if (tabName === 'scan') {
      router.replace('/(tabs)/scan-camera');
    } else if (tabName === 'type') {
      router.replace('/scan/type-ingredient');
    }
  };

  const allIngredients = Array.from(
    new Set([...scannedIngredients, ...pantryItems.map((i) => i.name)])
  );

  const getIngredientEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('garlic')) return '🧄';
    if (lower.includes('parsley')) return '🌿';
    if (lower.includes('pasta')) return '🍝';
    if (lower.includes('tomato')) return '🍅';
    if (lower.includes('butter')) return '🧈';
    if (lower.includes('cheese')) return '🧀';
    if (lower.includes('egg')) return '🥚';
    return '🥕';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Row */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/')} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Scroll List of Items */}
        <ScrollView style={styles.scrollList} contentContainerStyle={styles.listContent}>
          {allIngredients.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <Ionicons name="leaf-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No ingredients saved yet.</Text>
            </View>
          ) : (
            allIngredients.map((name) => {
              const pantryItem = pantryItems.find((pi) => pi.name === name);
              const handleDelete = () => {
                removeScannedIngredient(name);
                if (pantryItem) removePantryItem(pantryItem.id);
              };

              return (
                <View key={name} style={styles.ingredientCard}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.emoji}>{getIngredientEmoji(name)}</Text>
                    <Text style={styles.cardText}>{name}</Text>
                  </View>
                  
                  <View style={styles.cardRight}>
                    <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
                      <Ionicons name="heart" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Bottom panel */}
        <View style={styles.bottomPanel}>
          <TouchableOpacity 
            style={[styles.addBtn, allIngredients.length === 0 ? styles.addBtnDisabled : null]}
            onPress={handleAdd}
            disabled={allIngredients.length === 0}
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
            
            <TouchableOpacity 
              style={styles.modeTab} 
              onPress={() => handleTabPress('type')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeTabText}>Type Ingredients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modeTabActive} activeOpacity={0.8}>
              <Text style={styles.modeTabTextActive}>Saved</Text>
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
  scrollList: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 12,
  },
  ingredientCard: {
    height: 64,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    ...Colors.shadowSubtle,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 22,
    marginRight: 12,
  },
  cardText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
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
  addBtnDisabled: {
    backgroundColor: Colors.border,
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
    flex: 1,
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
    flex: 1.2,
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
