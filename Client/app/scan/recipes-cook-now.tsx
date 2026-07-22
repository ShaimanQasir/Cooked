import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../../store/useRecipeStore';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function RecipesCookNowScreen() {
  const router = useRouter();
  const { scannedIngredients, removeScannedIngredient, recipesCache, savedRecipes, toggleSaveRecipe } = useRecipeStore();

  // Pick recipes that match scanned ingredients
  const recipeIds = ['3', '4', '2', '1']; // Cheese Omelet, Alfredo Fettuccini, Lemon Grilled Salmon, Chicken Stir-Fry

  const handleRecipePress = (id: string) => {
    router.push({
      pathname: `/recipe/${id}`,
      params: { id }
    });
  };

  const handleScanMore = () => {
    router.replace('/(tabs)/scan-camera');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={Colors.text} />
          </TouchableOpacity>
          {/* Mini logo avatar on top right */}
          <Skeleton width={36} height={36} borderRadius={18} icon="person" />
        </View>

        {/* Heading */}
        <Text style={styles.headingTitle}>Recipes You Can Cook Now</Text>

        {/* Grid of matching recipes (Page 41) */}
        <View style={styles.gridContainer}>
          {recipeIds.map((id) => {
            const recipe = recipesCache[id];
            if (!recipe) return null;
            const isSaved = savedRecipes.some((s) => s.recipeId === Number(id));
            
            return (
              <TouchableOpacity
                key={id}
                style={styles.recipeCard}
                onPress={() => handleRecipePress(id)}
                activeOpacity={0.8}
              >
                <View style={styles.imageWrapper}>
                  <Skeleton height={110} borderRadius={12} icon="restaurant" />
                  
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={() => toggleSaveRecipe(Number(id))}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={isSaved ? 'heart' : 'heart-outline'} 
                      size={18} 
                      color={isSaved ? Colors.primary : Colors.textMuted} 
                    />
                  </TouchableOpacity>
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

        {/* Section: Your Ingredients */}
        <View style={styles.ingredientsHeader}>
          <Text style={styles.sectionTitle}>Your Ingredients</Text>
          <Text style={styles.sectionSubtitle}>
            We found {scannedIngredients.length} items in your kitchen
          </Text>
        </View>

        {/* Yellow tag chips of ingredients (Page 41) */}
        <View style={styles.chipsContainer}>
          {scannedIngredients.map((name) => (
            <View key={name} style={styles.chipPill}>
              <Text style={styles.chipText}>{name}</Text>
              <TouchableOpacity onPress={() => removeScannedIngredient(name)}>
                <Ionicons name="close-circle" size={16} color="#B27A1C" style={styles.closeIcon} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Edit and Filter Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionPill} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={18} color={Colors.text} />
            <Text style={styles.actionPillText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionPill} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={18} color={Colors.text} />
            <Text style={styles.actionPillText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Scan More button */}
        <TouchableOpacity 
          style={styles.scanMoreBtn}
          onPress={handleScanMore}
          activeOpacity={0.8}
        >
          <Text style={styles.scanMoreBtnText}>Scan More</Text>
        </TouchableOpacity>

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
  headingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  recipeCard: {
    width: '48%',
    marginBottom: 16,
  },
  imageWrapper: {
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 6,
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Colors.shadowSubtle,
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
  ingredientsHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF6D9', // Soft yellow pill
    borderWidth: 1,
    borderColor: '#EBD17F',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    ...Colors.shadowSubtle,
  },
  chipText: {
    color: '#8A5D11',
    fontWeight: '700',
    fontSize: 13,
  },
  closeIcon: {
    marginLeft: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionPill: {
    width: '48%',
    height: 52,
    backgroundColor: '#F3F2EE', // Soft light gray
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionPillText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  scanMoreBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Colors.shadowSubtle,
  },
  scanMoreBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
