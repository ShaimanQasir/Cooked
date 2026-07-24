import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  DimensionValue,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../store/useRecipeStore';
import Skeleton from './Skeleton';
import Colors from '../constants/Colors';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved?: boolean;
  onPress: () => void;
  onLike?: () => void;
  onFavorite?: () => void;
  width?: DimensionValue;
  marginRight?: number;
  marginBottom?: number;
}

export default function RecipeCard({
  recipe,
  isSaved = false,
  onPress,
  onLike,
  onFavorite,
  width = 220,
  marginRight = 16,
  marginBottom = 16,
}: RecipeCardProps) {
  const difficultyColor =
    recipe.difficulty === 'easy'
      ? '#22C55E'
      : recipe.difficulty === 'medium'
      ? '#F59E0B'
      : '#EF4444';

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: width as any, marginRight, marginBottom },
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.imageWrapper}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.image} />
        ) : (
          <Skeleton height={140} borderRadius={0} icon="restaurant" />
        )}

        {/* Top Right Action Buttons (Like & Heart) */}
        <View style={styles.topOverlayRow}>
          {onLike && (
            <TouchableOpacity
              style={[styles.overlayIconBtn, recipe.isLiked && styles.overlayIconBtnActive]}
              onPress={(e) => {
                e.stopPropagation();
                onLike();
              }}
              activeOpacity={0.75}
            >
              <Ionicons
                name={recipe.isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                size={14}
                color={recipe.isLiked ? Colors.primary : Colors.white}
              />
            </TouchableOpacity>
          )}

          {onFavorite && (
            <TouchableOpacity
              style={[styles.overlayIconBtn, isSaved && styles.overlayIconBtnActive]}
              onPress={(e) => {
                e.stopPropagation();
                onFavorite();
              }}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={14}
                color={isSaved ? Colors.primary : Colors.white}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Difficulty Tag */}
        {recipe.difficulty ? (
          <View style={[styles.diffTag, { backgroundColor: difficultyColor }]}>
            <Text style={styles.diffTagText}>{recipe.difficulty}</Text>
          </View>
        ) : null}
      </View>

      {/* Card Details Body */}
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>

        {recipe.cuisine ? (
          <Text style={styles.cuisineText} numberOfLines={1}>
            {recipe.cuisine} Cuisine
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{totalTime > 0 ? `${totalTime} min` : 'Quick'}</Text>
          </View>

          <Text style={styles.metaDot}>·</Text>

          {onLike ? (
            <TouchableOpacity
              style={styles.metaLikeBtn}
              onPress={(e) => {
                e.stopPropagation();
                onLike();
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={recipe.isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                size={12}
                color={recipe.isLiked ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.metaText, recipe.isLiked && styles.metaTextActive]}>
                {recipe.likesCount || 0}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.metaItem}>
              <Ionicons name="thumbs-up-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.metaText}>{recipe.likesCount || 0}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(235, 234, 228, 0.9)',
    overflow: 'hidden',
    shadowColor: '#1C1C1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrapper: {
    height: 135,
    width: '100%',
    backgroundColor: '#F5F4F0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topOverlayRow: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  overlayIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayIconBtnActive: {
    backgroundColor: Colors.white,
  },
  diffTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  diffTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'capitalize',
  },
  cardBody: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  cuisineText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  metaTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  metaDot: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
