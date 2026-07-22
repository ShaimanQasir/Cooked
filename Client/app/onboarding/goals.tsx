import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface GoalOption {
  id: string;
  title: string;
  icon: string;
  iconFamily: 'ion' | 'mci';
  color: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  { id: 'cook_home', title: 'Cook more at home and save money', icon: 'cash-outline', iconFamily: 'ion', color: '#2B8255' },
  { id: 'reduce_waste', title: 'Reduce food waste — use what I have', icon: 'recycle', iconFamily: 'mci', color: '#4CAF50' },
  { id: 'eat_healthier', title: 'Eat healthier and track nutrition', icon: 'heart-outline', iconFamily: 'ion', color: '#EA4335' },
  { id: 'discover', title: 'Discover new cuisines and recipes', icon: 'earth-outline', iconFamily: 'ion', color: '#1E90FF' },
  { id: 'meal_prep', title: 'Meal prep and plan my week', icon: 'calendar-outline', iconFamily: 'ion', color: '#FF9900' },
  { id: 'cook_scratch', title: 'Learn to cook from scratch', icon: 'book-outline', iconFamily: 'ion', color: '#8F5FDE' },
];

export default function GoalsScreen() {
  const router = useRouter();
  const { profile, toggleGoal, setProfile, saveOnboardingStep } = useUserStore();
  const selectedGoals = profile.goals;

  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelect = (id: string) => {
    if (selectedGoals.length >= 2 && !selectedGoals.includes(id)) {
      return;
    }
    toggleGoal(id);
  };

  const handleAddCustom = () => {
    const name = customInput.trim();
    if (!name) return;
    if (selectedGoals.length >= 2) return;
    if (!selectedGoals.includes(name)) {
      setProfile({ goals: [...selectedGoals, name] });
    }
    setCustomInput('');
    setShowCustomInput(false);
  };

  const handleRemoveCustom = (name: string) => {
    const updated = selectedGoals.filter((g) => g !== name);
    setProfile({ goals: updated });
  };

  const handleContinue = async () => {
    await saveOnboardingStep(16);
    router.push('/onboarding/health-info');
  };

  const renderIcon = (option: GoalOption, isSelected: boolean) => {
    const color = isSelected ? option.color : Colors.textMuted;
    if (option.iconFamily === 'ion') {
      return <Ionicons name={option.icon as any} size={28} color={color} />;
    }
    return <MaterialCommunityIcons name={option.icon as any} size={28} color={color} />;
  };

  const customGoals = selectedGoals.filter(
    (g) => !GOAL_OPTIONS.some((o) => o.id === g)
  );

  return (
    <OnboardingWrapper
      currentStep="goals"
      title="What are your goals?"
      subtitle="Select up to 2 primary goals"
    >
      <View style={styles.formContainer}>
        <View style={styles.optionsList}>
          {GOAL_OPTIONS.map((option) => {
            const isSelected = selectedGoals.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected ? styles.optionCardActive : null
                ]}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.8}
              >
                <View style={styles.iconWrapper}>
                  {renderIcon(option, isSelected)}
                </View>
                <Text style={[styles.title, isSelected ? styles.titleActive : null]}>
                  {option.title}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Add Custom Goal */}
          <TouchableOpacity
            style={styles.addCard}
            onPress={() => setShowCustomInput(!showCustomInput)}
            activeOpacity={0.8}
          >
            <View style={styles.addIconWrapper}>
              <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.addTitle}>Add your own goal</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Input */}
        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your goal..."
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
        {customGoals.length > 0 && (
          <View style={styles.tagsContainer}>
            {customGoals.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveCustom(tag)}>
                  <Ionicons name="close-circle" size={16} color={Colors.white} style={styles.tagClose} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Dynamic Selection Status Indicator */}
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            {selectedGoals.length}/2 goals selected
          </Text>
        </View>
      </View>

      <Button
        title="Continue"
        onPress={handleContinue}
        variant={selectedGoals.length > 0 ? 'primary' : 'disabled'}
        style={styles.continueButton}
      />
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    marginTop: 10,
    width: '100%',
  },
  optionsList: {
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 76,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 12,
    ...Colors.shadowSubtle,
  },
  optionCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 16,
    flex: 1,
    lineHeight: 18,
  },
  titleActive: {
    color: Colors.text,
  },
  checkIcon: {
    marginLeft: 8,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 76,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  addIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 16,
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
  statusBox: {
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  continueButton: {
    marginTop: 24,
  },
});
