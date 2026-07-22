import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface FrequencyOption {
  id: string;
  backendValue: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { id: 'daily', backendValue: 'DAILY', title: 'Daily', subtitle: 'I cook every day', icon: 'calendar-outline', color: '#2B8255' },
  { id: 'few_times_week', backendValue: 'FEW_TIMES_WEEK', title: 'A few times a week', subtitle: 'Regular home cooking', icon: 'repeat-outline', color: '#1E90FF' },
  { id: 'weekends', backendValue: 'WEEKENDS', title: 'Only on weekends', subtitle: 'I cook when I have time', icon: 'hourglass-outline', color: '#FF9900' },
  { id: 'rarely', backendValue: 'RARELY', title: 'Rarely', subtitle: 'I mostly order or reheat', icon: 'time-outline', color: '#D2691E' },
];

export default function CookingFrequencyScreen() {
  const router = useRouter();
  const { profile, setProfile, saveOnboardingStep, saveProfileProgress } = useUserStore();
  const [selectedId, setSelectedId] = useState(profile.cookingFrequency || '');

  const getCookingFrequencyValue = () => {
    const option = FREQUENCY_OPTIONS.find((o) => o.id === selectedId || o.backendValue === selectedId);
    return option?.backendValue || selectedId;
  };

  const handleContinue = async () => {
    if (!selectedId) return;
    const value = getCookingFrequencyValue();
    setProfile({ cookingFrequency: value });
    await saveOnboardingStep(10);
    router.push('/onboarding/portions');
  };

  const handleSaveProgress = async () => {
    const value = getCookingFrequencyValue();
    await saveProfileProgress(9, { cookingFrequency: value });
  };

  return (
    <OnboardingWrapper
      currentStep="cooking-frequency"
      title="How often do you cook?"
      subtitle="This helps us plan the right amount of recipes"
      onSaveProgress={handleSaveProgress}
    >
      <View style={styles.formContainer}>
        {FREQUENCY_OPTIONS.map((option) => {
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
    borderColor: Colors.border, paddingHorizontal: 16, marginBottom: 12, ...Colors.shadowSubtle,
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
