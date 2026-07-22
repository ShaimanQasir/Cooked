import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface PlanOption {
  id: string;
  backendValue: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const PLAN_OPTIONS: PlanOption[] = [
  { id: 'weekly', backendValue: 'WEEKLY', title: 'Weekly meal plan', subtitle: 'Get a full plan every week', icon: 'document-text-outline', color: '#1E90FF' },
  { id: 'daily', backendValue: 'DAILY', title: 'Daily suggestions', subtitle: 'One recipe each morning', icon: 'sunny-outline', color: '#FFA500' },
  { id: 'myself', backendValue: 'FLEXIBLE', title: "I'll plan myself", subtitle: 'Just show me recipes', icon: 'search-outline', color: '#C63A2F' },
  { id: 'ingredients', backendValue: 'FLEXIBLE', title: 'Plan by ingredients', subtitle: 'Scan my fridge, give me a plan', icon: 'camera-outline', color: '#2B8255' },
];

export default function MealPlanPrefScreen() {
  const router = useRouter();
  const { profile, setProfile, saveOnboardingStep, saveProfileProgress } = useUserStore();
  const [selectedId, setSelectedId] = useState(profile.mealPlanPreference || 'myself');

  const getMealPlanPrefValue = () => {
    const option = PLAN_OPTIONS.find((o) => o.id === selectedId || o.backendValue === selectedId);
    return option?.backendValue || selectedId;
  };

  const handleContinue = async () => {
    if (!selectedId) return;
    const value = getMealPlanPrefValue();
    setProfile({ mealPlanPreference: value });
    await saveOnboardingStep(14);
    router.push('/onboarding/notifications');
  };

  const handleSaveProgress = async () => {
    const value = getMealPlanPrefValue();
    await saveProfileProgress(13, { mealPlanPreference: value });
  };

  return (
    <OnboardingWrapper
      currentStep="meal-plan-pref"
      title="How do you like to plan meals?"
      subtitle="We'll customize the experience for you"
      onSaveProgress={handleSaveProgress}
    >
      <View style={styles.formContainer}>
        {PLAN_OPTIONS.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, isSelected && styles.optionCardActive]}
              onPress={() => setSelectedId(option.id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                <Ionicons name={option.icon} size={26} color={isSelected ? option.color : Colors.textMuted} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={[styles.title, isSelected && styles.titleActive]}>{option.title}</Text>
                <Text style={styles.subtitle}>{option.subtitle}</Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        title="Continue"
        onPress={handleContinue}
        variant={selectedId ? 'primary' : 'disabled'}
        style={styles.continueButton}
      />
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  formContainer: { flex: 1, marginTop: 10, width: '100%' },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', height: 80,
    backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1.5,
    borderColor: Colors.border, paddingHorizontal: 16, marginBottom: 16, ...Colors.shadowSubtle,
  },
  optionCardActive: { borderColor: Colors.primary, borderWidth: 2 },
  iconWrapper: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.cardAlt,
    justifyContent: 'center', alignItems: 'center',
  },
  textWrapper: { flex: 1, marginLeft: 16 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text },
  titleActive: { color: Colors.text },
  subtitle: { fontSize: 13, fontWeight: '500', color: Colors.textMuted, marginTop: 4 },
  continueButton: { marginTop: 24 },
});
