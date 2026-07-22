import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const SUGGESTED_DISLIKES = [
  'Onions', 'Garlic', 'Broccoli', 'Spinach',
  'Cheese', 'Eggs', 'Seafood', 'Chicken',
  'Tomatos', 'Bell Peppers', 'Anchovies',
  'Bitter melon', 'Brussels sprouts', 'Pickles',
  'Oysters', 'Cilantro', 'Mushrooms', 'Olives',
  'Tofu', 'Others'
];

export default function DislikesScreen() {
  const router = useRouter();
  const { profile, toggleDislike, addDislike, removeDislike, setProfile, saveOnboardingStep } = useUserStore();
  const selectedDislikes = profile.dislikes;

  const [inputVal, setInputVal] = useState('');
  const [showOthersInput, setShowOthersInput] = useState(false);

  const handleToggleChip = (name: string) => {
    if (name === 'Others') {
      setShowOthersInput(!showOthersInput);
      return;
    }
    toggleDislike(name);
  };

  const handleAddCustom = () => {
    const name = inputVal.trim();
    if (!name) return;
    addDislike(name);
    setInputVal('');
  };

  const handleContinue = async () => {
    await saveOnboardingStep(7);
    router.push('/onboarding/skill-level');
  };

  const handleSkip = async () => {
    setProfile({ dislikes: [] });
    await saveOnboardingStep(7);
    router.push('/onboarding/skill-level');
  };

  return (
    <OnboardingWrapper
      currentStep="dislikes"
      title="Foods you dislike"
      subtitle="We'll avoid these in your recipes"
    >
      <View style={styles.content}>
        {/* Search & Add row */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Type an ingredient..."
            placeholderTextColor={Colors.textLight}
            value={inputVal}
            onChangeText={setInputVal}
            onSubmitEditing={handleAddCustom}
          />
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={handleAddCustom}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Suggested Chips Grid */}
        <View style={styles.chipsContainer}>
          {SUGGESTED_DISLIKES.map((name) => {
            const isSelected = selectedDislikes.includes(name);
            const isOthers = name === 'Others';
            const isActive = isOthers ? showOthersInput : isSelected;
            
            return (
              <TouchableOpacity
                key={name}
                style={[
                  styles.chip,
                  isActive ? styles.chipActive : null
                ]}
                onPress={() => handleToggleChip(name)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : null
                ]}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Input for "Others" (Page 10) */}
        {showOthersInput && (
          <View style={styles.specifyContainer}>
            <TextInput
              style={styles.specifyInput}
              placeholder="What else do you dislike?"
              placeholderTextColor={Colors.textLight}
              value={inputVal}
              onChangeText={setInputVal}
              onSubmitEditing={handleAddCustom}
            />
          </View>
        )}

        {/* Display selected dislikes list (Page 9) */}
        {selectedDislikes.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedHeading}>Your dislikes:</Text>
            <View style={styles.selectedChipsContainer}>
              {selectedDislikes.map((name) => (
                <View key={name} style={styles.selectedChip}>
                  <Text style={styles.selectedChipText}>{name}</Text>
                  <TouchableOpacity onPress={() => removeDislike(name)}>
                    <Ionicons name="close" size={16} color={Colors.white} style={styles.closeIcon} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="Skip — I eat most things"
          onPress={handleSkip}
          variant="secondary"
          style={styles.skipButton}
        />
        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  addBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 10,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  chipTextActive: {
    color: Colors.white,
  },
  specifyContainer: {
    marginBottom: 16,
  },
  specifyInput: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  selectedSection: {
    marginTop: 16,
    width: '100%',
  },
  selectedHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  selectedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChipText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  closeIcon: {
    marginLeft: 6,
  },
  footer: {
    marginTop: 24,
    width: '100%',
  },
  skipButton: {
    marginBottom: 12,
  },
  continueButton: {},
});
