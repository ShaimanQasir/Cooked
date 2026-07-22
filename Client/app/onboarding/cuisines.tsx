import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface Cuisine {
  id: string;
  name: string;
  emoji: string;
}

const CUISINES: Cuisine[] = [
  { id: 'italian', name: 'Italian', emoji: '🍕' },
  { id: 'japanese', name: 'Japanese', emoji: '🍣' },
  { id: 'mexican', name: 'Mexican', emoji: '🌮' },
  { id: 'chinese', name: 'Chinese', emoji: '🥢' },
  { id: 'thai', name: 'Thai', emoji: '🍜' },
  { id: 'middle_eastern', name: 'Middle Eastern', emoji: '🥙' },
  { id: 'west_african', name: 'West African', emoji: '🍲' },
  { id: 'east_african', name: 'East African', emoji: '🍛' },
  { id: 'caribbean', name: 'Caribbean', emoji: '🍗' },
  { id: 'korean', name: 'Korean', emoji: '🥘' },
  { id: 'indian', name: 'Indian', emoji: '🍛' },
  { id: 'french', name: 'French', emoji: '🥐' },
  { id: 'mediterranean', name: 'Mediterranean', emoji: '🫒' },
  { id: 'vietnamese', name: 'Vietnamese', emoji: '🍲' },
  { id: 'ethiopian', name: 'Ethiopian', emoji: '🫓' },
];

export default function CuisinesScreen() {
  const router = useRouter();
  const { profile, toggleCuisine, setProfile, saveOnboardingStep } = useUserStore();
  const selectedCuisines = profile.favoriteCuisines;

  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelect = (id: string) => {
    if (selectedCuisines.length >= 6 && !selectedCuisines.includes(id)) {
      return;
    }
    toggleCuisine(id);
  };

  const handleAddCustom = () => {
    const name = customInput.trim();
    if (!name) return;
    if (selectedCuisines.length >= 6) return;
    if (!selectedCuisines.includes(name)) {
      setProfile({ favoriteCuisines: [...selectedCuisines, name] });
    }
    setCustomInput('');
    setShowCustomInput(false);
  };

  const handleRemoveCustom = (name: string) => {
    const updated = selectedCuisines.filter((c) => c !== name);
    setProfile({ favoriteCuisines: updated });
  };

  const handleContinue = async () => {
    await saveOnboardingStep(12);
    router.push('/onboarding/kitchen');
  };

  const customCuisines = selectedCuisines.filter(
    (c) => !CUISINES.some((cu) => cu.id === c)
  );

  return (
    <OnboardingWrapper
      currentStep="cuisines"
      title="Which cuisines do you love?"
      subtitle="Select up to 6 favorites"
    >
      <View style={styles.container}>
        <View style={styles.grid}>
          {CUISINES.map((cuisine) => {
            const isSelected = selectedCuisines.includes(cuisine.id);
            return (
              <TouchableOpacity
                key={cuisine.id}
                style={[
                  styles.card,
                  isSelected ? styles.cardActive : null
                ]}
                onPress={() => handleSelect(cuisine.id)}
                activeOpacity={0.8}
              >
                <View style={styles.imagePlaceholder}>
                  <Skeleton height={110} icon="restaurant" />
                  <Text style={styles.emojiText}>{cuisine.emoji}</Text>
                </View>
                <View style={styles.labelContainer}>
                  <Text style={[styles.labelText, isSelected ? styles.labelTextActive : null]}>
                    {cuisine.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add Custom Button */}
          <TouchableOpacity
            style={styles.addCard}
            onPress={() => setShowCustomInput(!showCustomInput)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
            <Text style={styles.addCardText}>Add Custom</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Input */}
        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a cuisine..."
                placeholderTextColor={Colors.textLight}
                value={customInput}
                onChangeText={setCustomInput}
                onSubmitEditing={handleAddCustom}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddCustom}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Custom Tags Display */}
        {customCuisines.length > 0 && (
          <View style={styles.tagsContainer}>
            {customCuisines.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveCustom(tag)}>
                  <Ionicons name="close-circle" size={16} color={Colors.white} style={styles.tagClose} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Selection Count */}
        <View style={styles.countBox}>
          <Text style={styles.countText}>
            {selectedCuisines.length}/6 cuisines selected
          </Text>
        </View>
      </View>

      <Button
        title="Continue"
        onPress={handleContinue}
        variant={selectedCuisines.length > 0 ? 'primary' : 'disabled'}
        style={styles.continueButton}
      />
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    ...Colors.shadowSubtle,
  },
  cardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  imagePlaceholder: {
    height: 110,
    position: 'relative',
  },
  emojiText: {
    fontSize: 28,
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  labelContainer: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  labelTextActive: {
    color: Colors.text,
    fontWeight: '800',
  },
  addCard: {
    width: '48%',
    height: 154,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 6,
  },
  customInputContainer: {
    marginTop: 8,
    marginBottom: 12,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  addButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  tagClose: {
    marginLeft: 6,
  },
  countBox: {
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  continueButton: {
    marginTop: 24,
  },
});
