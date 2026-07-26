import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
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
    const key = item.recipeName || 'Custom Items';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const handleAddGrocery = () => {
    router.push('/grocery/add-grocery-modal');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Row - Pure Title, NO Back Arrow */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Grocery List</Text>
          <TouchableOpacity style={styles.calendarBtn} activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Scroll List organized by recipe name */}
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
                      <Ionicons name="nutrition-outline" size={16} color={Colors.primary} style={styles.itemIcon} />
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

        {/* Floating Add Button on bottom-right */}
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
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 24,
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
    paddingTop: 12,
    paddingBottom: 90,
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textMuted,
  },
  recipeGroup: {
    marginBottom: 20,
  },
  recipeGroupHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  groceryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginLeft: 10,
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  itemQtyChecked: {
    color: Colors.textLight,
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
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
