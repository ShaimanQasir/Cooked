import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGroceryStore, GroceryItem } from '../../store/useGroceryStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function GroceryListScreen() {
  const router = useRouter();
  const { 
    items, 
    loading, 
    fetchGroceryItems, 
    toggleItemChecked, 
    deleteList, 
    removeItem, 
    addItem, 
    updateItem 
  } = useGroceryStore();
  const [refreshing, setRefreshing] = useState(false);

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editListName, setEditListName] = useState('');

  // Quick Add Item Modal State
  const [quickAddListName, setQuickAddListName] = useState<string | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickQty, setQuickQty] = useState('');
  const [quickUnit, setQuickUnit] = useState('');

  useEffect(() => {
    fetchGroceryItems();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroceryItems();
    setRefreshing(false);
  };

  // Group items by listName
  const groupedItems = items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    const key = item.listName || item.recipeName || 'Custom Items';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/');
    }
  };

  const handleDeleteList = (listName: string) => {
    Alert.alert(
      'Delete Grocery List',
      `Are you sure you want to delete the list "${listName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteList(listName) 
        },
      ]
    );
  };

  const handleOpenEditItem = (item: GroceryItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditQty(item.quantity || '');
    setEditUnit(item.unit || '');
    setEditListName(item.listName);
  };

  const handleSaveEditItem = async () => {
    if (!editingItem) return;
    if (!editName.trim()) {
      Alert.alert('Missing Name', 'Item name cannot be empty.');
      return;
    }
    await updateItem(editingItem.id, {
      name: editName.trim(),
      quantity: editQty.trim(),
      unit: editUnit.trim(),
      listName: editListName.trim() || 'Custom Items',
    });
    setEditingItem(null);
  };

  const handleOpenQuickAdd = (listName: string) => {
    setQuickAddListName(listName);
    setQuickName('');
    setQuickQty('');
    setQuickUnit('');
  };

  const handleSaveQuickAdd = async () => {
    if (!quickAddListName || !quickName.trim()) {
      Alert.alert('Missing Name', 'Item name cannot be empty.');
      return;
    }
    await addItem(quickName.trim(), quickQty.trim(), quickUnit.trim(), quickAddListName);
    setQuickAddListName(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Row - Back Arrow + Title */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Grocery List</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.headerActionBtn}
            onPress={() => router.push('/grocery/add-grocery-modal')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={26} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Scroll List organized by Grocery List Name */}
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
              <Text style={styles.emptyText}>Loading grocery lists…</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <Ionicons name="cart-outline" size={54} color={Colors.textLight} />
              <Text style={styles.emptyTextTitle}>No Grocery Lists Yet</Text>
              <Text style={styles.emptyTextSub}>
                Create a custom list or click "Add to Grocery" on any recipe!
              </Text>
              <TouchableOpacity 
                style={styles.emptyCreateBtn}
                onPress={() => router.push('/grocery/add-grocery-modal')}
              >
                <Text style={styles.emptyCreateBtnText}>+ Create Grocery List</Text>
              </TouchableOpacity>
            </View>
          ) : (
            Object.keys(groupedItems).map((listName) => {
              const listItems = groupedItems[listName];
              const checkedCount = listItems.filter((i) => i.checked).length;

              return (
                <View key={listName} style={styles.recipeGroup}>
                  {/* List Section Header */}
                  <View style={styles.groupHeaderRow}>
                    <View style={styles.groupHeaderTitleBox}>
                      <Text style={styles.recipeGroupHeader}>{listName}</Text>
                      <View style={styles.countPill}>
                        <Text style={styles.countPillText}>
                          {checkedCount}/{listItems.length}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.groupActions}>
                      <TouchableOpacity 
                        onPress={() => handleOpenQuickAdd(listName)} 
                        style={styles.iconActionBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={20} color={Colors.primary} />
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => handleDeleteList(listName)} 
                        style={styles.iconActionBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* List Item Cards */}
                  {listItems.map((item) => (
                    <View key={item.id} style={styles.groceryRow}>
                      <TouchableOpacity
                        style={styles.rowLeft}
                        onPress={() => toggleItemChecked(item.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons 
                          name={item.checked ? 'checkmark-circle' : 'ellipse-outline'} 
                          size={22} 
                          color={item.checked ? Colors.primary : Colors.textLight} 
                        />
                        <Ionicons 
                          name="nutrition-outline" 
                          size={16} 
                          color={Colors.primary} 
                          style={styles.itemIcon} 
                        />
                        <Text style={[styles.itemName, item.checked ? styles.itemNameChecked : null]}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.rowRight}>
                        {/* Quantity display (Optional string/number or empty) */}
                        <Text style={[styles.itemQty, item.checked ? styles.itemQtyChecked : null]}>
                          {item.quantity ? `${item.quantity} ${item.unit || ''}`.trim() : item.unit || ''}
                        </Text>

                        {/* Edit Item Trigger */}
                        <TouchableOpacity 
                          onPress={() => handleOpenEditItem(item)}
                          style={styles.itemActionBtn}
                        >
                          <Ionicons name="pencil-outline" size={16} color={Colors.textMuted} />
                        </TouchableOpacity>

                        {/* Delete Item Trigger */}
                        <TouchableOpacity 
                          onPress={() => removeItem(item.id)}
                          style={styles.itemActionBtn}
                        >
                          <Ionicons name="close" size={18} color={Colors.textLight} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Floating Add Button positioned cleanly ABOVE bottom tab bar */}
        <TouchableOpacity 
          style={styles.floatingAddBtn}
          onPress={() => router.push('/grocery/add-grocery-modal')}
          activeOpacity={0.88}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
          <Text style={styles.floatingAddBtnText}>Add</Text>
        </TouchableOpacity>

        {/* Edit Item Modal */}
        <Modal
          visible={editingItem !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditingItem(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalCardTitle}>Edit Item</Text>
                <TouchableOpacity onPress={() => setEditingItem(null)}>
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>List Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editListName}
                onChangeText={setEditListName}
                placeholder="List Name"
              />

              <Text style={styles.fieldLabel}>Item Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Item Name"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Quantity (Optional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editQty}
                    onChangeText={setEditQty}
                    placeholder="e.g. 250 or 2"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Unit</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editUnit}
                    onChangeText={setEditUnit}
                    placeholder="e.g. g, ml, tbsp"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveEditItem}>
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Quick Add Item Modal */}
        <Modal
          visible={quickAddListName !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setQuickAddListName(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalCardTitle}>Add Item to "{quickAddListName}"</Text>
                <TouchableOpacity onPress={() => setQuickAddListName(null)}>
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Item Name</Text>
              <TextInput
                style={styles.modalInput}
                value={quickName}
                onChangeText={setQuickName}
                placeholder="e.g. Olive Oil"
                autoFocus={true}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Quantity (Optional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={quickQty}
                    onChangeText={setQuickQty}
                    placeholder="e.g. 1"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Unit</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={quickUnit}
                    onChangeText={setQuickUnit}
                    placeholder="e.g. bottle"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveQuickAdd}>
                <Text style={styles.modalSaveBtnText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    paddingHorizontal: 16,
    marginTop: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  headerActionBtn: {
    padding: 6,
  },
  scrollList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110, // Generous padding so floating button never covers content
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 14,
  },
  emptyTextSub: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  emptyCreateBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  emptyCreateBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textMuted,
  },
  recipeGroup: {
    marginBottom: 22,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  groupHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  recipeGroupHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  countPill: {
    backgroundColor: '#FAF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconActionBtn: {
    padding: 6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groceryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
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
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginRight: 4,
  },
  itemQtyChecked: {
    color: Colors.textLight,
  },
  itemActionBtn: {
    padding: 4,
  },
  /* Floating Add Button positioned cleanly ABOVE bottom tab bar */
  floatingAddBtn: {
    position: 'absolute',
    bottom: 95, // High enough so tab bar and settings overlay NEVER hide it
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingAddBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 4,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalSaveBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
