import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  TextInput 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../../store/useRecipeStore';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function RecentlyViewedScreen() {
  const router = useRouter();
  const { recentlyViewed, recipesCache } = useRecipeStore();

  const handleRecipePress = (id: string) => {
    router.push({
      pathname: `/recipe/${id}`,
      params: { id }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Row (Page 51) */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recently Viewed</Text>
          <View style={styles.spacer} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            placeholder="Search recently viewed recepies.."
            placeholderTextColor={Colors.textLight}
            style={styles.searchInput}
          />
        </View>

        {/* Grid List of Recipes */}
        {recentlyViewed.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <Ionicons name="time-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>You haven’t viewed any recipes recently.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {recentlyViewed.map((rId) => {
              const recipe = recipesCache[rId];
              if (!recipe) return null;
              return (
                <TouchableOpacity
                  key={rId}
                  style={styles.card}
                  onPress={() => handleRecipePress(rId)}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageWrapper}>
                    <Skeleton height={110} borderRadius={12} icon="restaurant" />
                  </View>
                  <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text>
                  
                  <View style={styles.metricsRow}>
                    <Text style={styles.metricText}>
                      <Ionicons name="time-outline" size={12} /> {recipe.time}
                    </Text>
                    <Text style={[styles.metricText, { marginLeft: 8 }]}>
                      <Ionicons name="flame-outline" size={12} /> {recipe.kcal}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  spacer: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 52,
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
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 20,
  },
  imageWrapper: {
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
