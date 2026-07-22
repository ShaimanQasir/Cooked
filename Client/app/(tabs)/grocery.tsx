import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGroceryStore, GroceryItem } from '../../store/useGroceryStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function GroceryListScreen() {
  const router = useRouter();
  const { items, loading, fetchGroceryItems, toggleItemChecked } = useGroceryStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGroceryItems();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroceryItems();
    setRefreshing(false);
  };

  // Group items by recipe name
  const groupedItems = items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    if (!acc[item.recipeName]) {
      acc[item.recipeName] = [];
    }
    acc[item.recipeName].push(item);
    return acc;
  }, {});

  const getIngredientEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('garlic')) return '🧄';
    if (lower.includes('parsley')) return '🌿';
    if (lower.includes('lemon')) return '🍋';
    if (lower.includes('pasta') || lower.includes('fettuccine')) return '🍝';
    if (lower.includes('salt')) return '🧂';
    return '🥕';
  };

  const handleAddGrocery = () => {
    router.push('/grocery/add-grocery-modal');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Grocery List</Text>
          <TouchableOpacity style={styles.calendarBtn}>
            <Ionicons name="calendar-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Scroll List organized by recipe name (Page 43) */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {loading && items.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.emptyText}>Loading grocery list…</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <Ionicons name="cart-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Your grocery list is empty.</Text>
            </View>
          ) : (
            Object.keys(groupedItems).map((recipeName) => (
              <View key={recipeName} style={styles.recipeGroup}>
                <Text style={styles.recipeGroupHeader}>{recipeName}</Text>
                
                {groupedItems[recipeName].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.groceryRow}
                    onPress={() => toggleItemChecked(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.rowLeft}>
                      <Ionicons 
                        name={item.checked ? 'checkmark-circle' : 'ellipse-outline'} 
                        size={22} 
                        color={item.checked ? Colors.primary : Colors.textLight} 
                      />
                      <Text style={styles.emoji}>{getIngredientEmoji(item.name)}</Text>
                      <Text style={[styles.itemName, item.checked ? styles.itemNameChecked : null]}>
                        {item.name}
                      </Text>
                    </View>
                    <Text style={[styles.itemQty, item.checked ? styles.itemQtyChecked : null]}>
                      {item.quantity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </ScrollView>

        {/* Floating Add Button on bottom-right (Page 43) */}
        <TouchableOpacity 
          style={styles.floatingAddBtn}
          onPress={handleAddGrocery}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
          <Text style={styles.floatingAddBtnText}>Add</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  calendarBtn: {
    padding: 6,
  },
  scrollList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100, // Room for floating button
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 12,
  },
  recipeGroup: {
    marginBottom: 24,
  },
  recipeGroupHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  groceryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
    marginLeft: 12,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  itemQtyChecked: {
    color: Colors.textLight,
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingAddBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
});
