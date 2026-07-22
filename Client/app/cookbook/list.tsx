import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../../store/useRecipeStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function CookbooksListScreen() {
  const router = useRouter();
  const { cookbooks, fetchCookBooks } = useRecipeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCookBooks();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCookBooks();
    setRefreshing(false);
  };

  const handleCookbookPress = (id: number) => {
    router.push(`/cookbook/${id}`);
  };

  const filteredCookbooks = cookbooks.filter((cb) =>
    cb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cb.description && cb.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>All Cookbooks</Text>
              <Text style={styles.headerSubtitle}>{cookbooks.length} collection{cookbooks.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/cookbook/add')} 
            style={styles.addCookbookBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search your cookbooks…"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Grid List of Cookbooks */}
        {filteredCookbooks.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="book-outline" size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No cookbooks found' : 'No cookbooks created yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try searching with a different term'
                : 'Create your first cookbook collection to organize your favorite recipes!'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.createFirstBtn}
                onPress={() => router.push('/cookbook/add')}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
                <Text style={styles.createFirstBtnText}>Create Cookbook</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredCookbooks.map((cb) => (
              <TouchableOpacity
                key={cb.id}
                style={styles.card}
                onPress={() => handleCookbookPress(cb.id)}
                activeOpacity={0.85}
              >
                {/* Collage / Cover Art */}
                <View style={styles.coverBox}>
                  <View style={styles.coverIconCircle}>
                    <Ionicons name="book" size={32} color={Colors.primary} />
                  </View>
                  <View style={styles.countPill}>
                    <Text style={styles.countPillText}>{cb.recipesCount || cb.recipes?.length || 0} recipes</Text>
                  </View>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cookbookName} numberOfLines={1}>{cb.name}</Text>
                  <Text style={styles.cookbookDesc} numberOfLines={1}>
                    {cb.description || 'Custom collection'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    paddingTop: 14,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 1,
  },
  addCookbookBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 24,
    ...Colors.shadowSubtle,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  createFirstBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#1C1C1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  coverBox: {
    height: 110,
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#FAF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  coverIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(28, 28, 26, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  cardInfo: {
    paddingHorizontal: 2,
  },
  cookbookName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  cookbookDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
});
