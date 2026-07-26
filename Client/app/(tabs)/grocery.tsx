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
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGroceryStore, GroceryItem } from '../../store/useGroceryStore';
import { useAlertStore } from '../../store/useAlertStore';
import BottomActionSheet, { ActionSheetOption } from '../../components/BottomActionSheet';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  
  const { showAlert } = useAlertStore();

  const [refreshing, setRefreshing] = useState(false);

  // Track expanded state of cards (by listName)
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>({});

  // List Action Sheet State
  const [activeListMenu, setActiveListMenu] = useState<string | null>(null);

  // Item Action Sheet State
  const [activeItemMenu, setActiveItemMenu] = useState<GroceryItem | null>(null);

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

  const toggleExpand = (listName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedLists((prev) => ({
      ...prev,
      [listName]: prev[listName] === undefined ? false : !prev[listName],
    }));
  };

  const isListExpanded = (listName: string) => {
    return expandedLists[listName] !== false;
  };

  const handleDeleteListConfirmed = (listName: string) => {
    setActiveListMenu(null);
    showAlert({
      title: 'Delete Grocery List',
      message: `Are you sure you want to delete "${listName}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete List',
      cancelText: 'Cancel',
      onConfirm: () => deleteList(listName),
    });
  };

  const handleClearChecked = (listName: string) => {
    setActiveListMenu(null);
    const listItems = groupedItems[listName] || [];
    const checked = listItems.filter((i) => i.checked);
    if (checked.length === 0) {
      showAlert({
        title: 'No Bought Items',
        message: 'There are no checked items to clear in this list.',
        type: 'info',
        confirmText: 'OK',
        cancelText: '',
      });
      return;
    }
    showAlert({
      title: 'Clear Bought Items',
      message: `Clear ${checked.length} bought item(s) from "${listName}"?`,
      type: 'warning',
      confirmText: 'Clear Items',
      cancelText: 'Cancel',
      onConfirm: () => checked.forEach((item) => removeItem(item.id)),
    });
  };

  const handleOpenEditItem = (item: GroceryItem) => {
    setActiveItemMenu(null);
    setEditingItem(item);
    setEditName(item.name);
    setEditQty(item.quantity || '');
    setEditUnit(item.unit || '');
    setEditListName(item.listName);
  };

  const handleSaveEditItem = async () => {
    if (!editingItem) return;
    if (!editName.trim()) {
      showAlert({
        title: 'Missing Name',
        message: 'Item name cannot be empty.',
        type: 'warning',
        confirmText: 'OK',
        cancelText: '',
      });
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
    setActiveListMenu(null);
    setQuickAddListName(listName);
    setQuickName('');
    setQuickQty('');
    setQuickUnit('');
  };

  const handleSaveQuickAdd = async () => {
    if (!quickAddListName || !quickName.trim()) {
      showAlert({
        title: 'Missing Name',
        message: 'Item name cannot be empty.',
        type: 'warning',
        confirmText: 'OK',
        cancelText: '',
      });
      return;
    }
    await addItem(quickName.trim(), quickQty.trim(), quickUnit.trim(), quickAddListName);
    setQuickAddListName(null);
  };

  // Build List Action Sheet Options
  const getListMenuOptions = (listName: string): ActionSheetOption[] => [
    {
      label: 'Add New Item',
      icon: 'add-circle-outline',
      iconColor: Colors.primary,
      onPress: () => handleOpenQuickAdd(listName),
    },
    {
      label: 'Clear Bought Items',
      icon: 'checkmark-done-circle-outline',
      iconColor: Colors.text,
      onPress: () => handleClearChecked(listName),
    },
    {
      label: 'Delete Grocery List',
      icon: 'trash-outline',
      isDestructive: true,
      onPress: () => handleDeleteListConfirmed(listName),
    },
  ];

  // Build Item Action Sheet Options
  const getItemMenuOptions = (item: GroceryItem): ActionSheetOption[] => [
    {
      label: 'Edit Item Details',
      icon: 'create-outline',
      iconColor: Colors.primary,
      onPress: () => handleOpenEditItem(item),
    },
    {
      label: 'Remove Item',
      icon: 'trash-outline',
      isDestructive: true,
      onPress: () => {
        showAlert({
          title: 'Remove Item',
          message: `Remove "${item.name}" from grocery list?`,
          type: 'danger',
          confirmText: 'Remove',
          cancelText: 'Cancel',
          onConfirm: () => removeItem(item.id),
        });
      },
    },
  ];

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

        {/* Scroll List of Horizontal Cards */}
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
              const isExpanded = isListExpanded(listName);
              const progressPct = Math.round((checkedCount / (listItems.length || 1)) * 100);

              return (
                <View key={listName} style={styles.listCardContainer}>
                  {/* Full Width Horizontal Card Header */}
                  <TouchableOpacity
                    style={styles.listCardHeader}
                    onPress={() => toggleExpand(listName)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.cardHeaderTop}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={[styles.cardIconBadge, checkedCount === listItems.length && listItems.length > 0 && styles.badgeComplete]}>
                          <Ionicons 
                            name={checkedCount === listItems.length && listItems.length > 0 ? "checkmark-done" : "cart"} 
                            size={18} 
                            color={checkedCount === listItems.length && listItems.length > 0 ? Colors.white : Colors.primary} 
                          />
                        </View>

                        <View style={styles.cardTitleBox}>
                          <Text style={styles.cardTitleText} numberOfLines={1}>{listName}</Text>
                          <Text style={styles.cardSubText}>
                            {checkedCount} of {listItems.length} bought ({progressPct}%)
                          </Text>
                        </View>
                      </View>

                      {/* Right Action Cluster with 3 Vertical Dots */}
                      <View style={styles.cardHeaderRight}>
                        <TouchableOpacity
                          style={styles.threeDotsBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            setActiveListMenu(listName);
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="ellipsis-vertical" size={20} color={Colors.text} />
                        </TouchableOpacity>

                        <View style={styles.chevronBox}>
                          <Ionicons 
                            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                            size={18} 
                            color={Colors.textMuted} 
                          />
                        </View>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarTrack}>
                      <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                    </View>
                  </TouchableOpacity>

                  {/* Expandable Detail View */}
                  {isExpanded && (
                    <View style={styles.cardDetailsBody}>
                      {listItems.map((item) => (
                        <View key={item.id} style={styles.ingredientRow}>
                          {/* Checkbox Tick Option */}
                          <TouchableOpacity
                            style={styles.ingLeft}
                            onPress={() => toggleItemChecked(item.id)}
                            activeOpacity={0.7}
                          >
                            <Ionicons 
                              name={item.checked ? 'checkmark-circle' : 'ellipse-outline'} 
                              size={22} 
                              color={item.checked ? Colors.primary : Colors.textLight} 
                            />
                            <Text style={[styles.ingName, item.checked && styles.ingNameChecked]}>
                              {item.name}
                            </Text>
                          </TouchableOpacity>

                          {/* Item Quantity & 3 Vertical Dots Button */}
                          <View style={styles.ingRight}>
                            <Text style={[styles.ingQtyText, item.checked && styles.ingQtyChecked]}>
                              {item.quantity ? `${item.quantity} ${item.unit || ''}`.trim() : item.unit || ''}
                            </Text>

                            <TouchableOpacity 
                              style={styles.itemThreeDotsBtn}
                              onPress={() => setActiveItemMenu(item)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}

                      {/* Quick Add Button inside Card */}
                      <TouchableOpacity 
                        style={styles.addToListBar}
                        onPress={() => handleOpenQuickAdd(listName)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="add" size={18} color={Colors.primary} />
                        <Text style={styles.addToListBarText}>Add item to {listName}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
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
          <Text style={styles.floatingAddBtnText}>Add List</Text>
        </TouchableOpacity>

        {/* Bottom-Up Action Dialogue for List (3 Vertical Dots) */}
        <BottomActionSheet
          visible={activeListMenu !== null}
          title={activeListMenu || ''}
          options={activeListMenu ? getListMenuOptions(activeListMenu) : []}
          onClose={() => setActiveListMenu(null)}
        />

        {/* Bottom-Up Action Dialogue for Item (3 Vertical Dots) */}
        <BottomActionSheet
          visible={activeItemMenu !== null}
          title={activeItemMenu?.name || ''}
          options={activeItemMenu ? getItemMenuOptions(activeItemMenu) : []}
          onClose={() => setActiveItemMenu(null)}
        />

        {/* Edit Item Modal */}
        <Modal
          visible={editingItem !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditingItem(null)}
        >
          <View style={styles.modalBackdrop}>
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
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalCardTitle}>Add to "{quickAddListName}"</Text>
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
    paddingBottom: 110,
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

  /* Horizontal Card Styles */
  listCardContainer: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  listCardHeader: {
    padding: 16,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  cardIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FAF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  badgeComplete: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  cardSubText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threeDotsBtn: {
    padding: 6,
    borderRadius: 8,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },

  /* Expandable Details Body */
  cardDetailsBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  ingName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 10,
    flex: 1,
  },
  ingNameChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  ingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ingQtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  ingQtyChecked: {
    color: Colors.textLight,
  },
  itemThreeDotsBtn: {
    padding: 4,
    marginLeft: 4,
  },
  addToListBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addToListBarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 4,
  },

  /* Floating Add Button */
  floatingAddBtn: {
    position: 'absolute',
    bottom: 95,
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

  /* Modal Form Card */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
