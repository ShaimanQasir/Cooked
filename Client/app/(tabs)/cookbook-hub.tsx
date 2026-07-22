import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore, Cookbook } from '../../store/useRecipeStore';
import { useGroceryStore } from '../../store/useGroceryStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface HubCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  count?: number;
  color: string;
  onPress: () => void;
}

const HubCard: React.FC<HubCardProps> = ({ icon, title, subtitle, count, color, onPress }) => (
  <TouchableOpacity
    style={styles.hubCard}
    onPress={onPress}
    activeOpacity={0.82}
  >
    <View style={[styles.hubCardIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.hubCardInfo}>
      <Text style={styles.hubCardTitle}>{title}</Text>
      <Text style={styles.hubCardSubtitle} numberOfLines={1}>{subtitle}</Text>
    </View>
    <View style={styles.hubCardRight}>
      {count !== undefined && (
        <View style={[styles.countBadge, { backgroundColor: color + '18' }]}>
          <Text style={[styles.countText, { color }]}>{count}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </View>
  </TouchableOpacity>
);

export default function CookbookHubScreen() {
  const router = useRouter();
  const { cookbooks, fetchCookBooks, recipes } = useRecipeStore();
  const { items } = useGroceryStore();
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

  const totalRecipes = cookbooks.reduce((acc, cb) => acc + (cb.recipesCount || cb.recipes?.length || 0), 0);
  const groceryCount = items.filter((i) => !i.checked).length;

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
        {/* Screen Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View>
              <Text style={styles.headerTitle}>Cookbook Hub</Text>
              <Text style={styles.headerSubtitle}>Organize, collect & generate recipes</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtnHeader}
              onPress={() => router.push('/cookbook/add')}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
              <Text style={styles.addBtnText}>New</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="Search cookbooks & collections…"
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, { borderTopColor: Colors.primary }]}
            onPress={() => router.push('/cookbook/list')}
            activeOpacity={0.85}
          >
            <View style={[styles.statIconBg, { backgroundColor: '#FFF1F0' }]}>
              <Ionicons name="book" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.statNumber}>{cookbooks.length}</Text>
            <Text style={styles.statLabel}>Cookbooks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { borderTopColor: '#22C55E' }]}
            onPress={() => router.push('/recipe/my-recipes')}
            activeOpacity={0.85}
          >
            <View style={[styles.statIconBg, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="restaurant" size={18} color="#22C55E" />
            </View>
            <Text style={styles.statNumber}>{recipes.length}</Text>
            <Text style={styles.statLabel}>My Recipes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { borderTopColor: '#F59E0B' }]}
            onPress={() => router.push('/(tabs)/grocery')}
            activeOpacity={0.85}
          >
            <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="cart" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{groceryCount}</Text>
            <Text style={styles.statLabel}>Groceries</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Preview of Collections if available */}
        {cookbooks.length > 0 && (
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Featured Collections</Text>
            <TouchableOpacity onPress={() => router.push('/cookbook/list')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
        )}

        {cookbooks.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {cookbooks.slice(0, 4).map((cb) => (
              <TouchableOpacity
                key={cb.id}
                style={styles.featuredCard}
                onPress={() => router.push(`/cookbook/${cb.id}`)}
                activeOpacity={0.85}
              >
                <View style={styles.featuredCardCover}>
                  <View style={styles.featuredCoverIcon}>
                    <Ionicons name="book" size={28} color={Colors.primary} />
                  </View>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{cb.recipesCount || cb.recipes?.length || 0} recipes</Text>
                  </View>
                </View>
                <Text style={styles.featuredTitle} numberOfLines={1}>{cb.name}</Text>
                <Text style={styles.featuredSubtitle} numberOfLines={1}>
                  {cb.description || 'Custom Collection'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Management Options */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Kitchen Management</Text>
        <View style={styles.hubList}>
          <HubCard
            icon="book-outline"
            title="All Cookbooks"
            subtitle="Browse and edit your recipe collections"
            count={cookbooks.length}
            color={Colors.primary}
            onPress={() => router.push('/cookbook/list')}
          />
          <HubCard
            icon="cart-outline"
            title="Grocery List"
            subtitle="Organized ingredients to buy"
            count={groceryCount}
            color="#22C55E"
            onPress={() => router.push('/(tabs)/grocery')}
          />
          <HubCard
            icon="archive-outline"
            title="Pantry"
            subtitle="Track ingredients you have at home"
            color="#F59E0B"
            onPress={() => router.push('/scan/saved-ingredients')}
          />
        </View>

        {/* AI & Smart Tools */}
        <Text style={styles.sectionTitle}>Smart Tools</Text>
        <View style={styles.hubList}>
          <HubCard
            icon="sparkles-outline"
            title="Generate AI Recipe"
            subtitle="Create custom recipes tailored to your ingredients"
            color="#8B5CF6"
            onPress={() => router.push('/recipe/generate')}
          />
          <HubCard
            icon="link-outline"
            title="Import Web Recipe"
            subtitle="Import recipes instantly from any website link"
            color="#3B82F6"
            onPress={() => router.push('/(tabs)/import')}
          />
        </View>
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
    paddingTop: 12,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  addBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 4,
    shadowColor: '#1C1C1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  featuredScroll: {
    gap: 12,
    paddingBottom: 8,
    marginBottom: 16,
  },
  featuredCard: {
    width: 140,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  featuredCardCover: {
    height: 90,
    borderRadius: 14,
    backgroundColor: '#FAF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  featuredCoverIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(28, 28, 26, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
  },
  featuredTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  featuredSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  hubList: {
    marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  hubCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hubCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  hubCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  hubCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
