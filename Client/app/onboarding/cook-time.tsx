import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface TimeOption {
  id: string;
  backendValue: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const TIME_OPTIONS: TimeOption[] = [
  { id: 'any', backendValue: 'ANY_TIME', title: 'Any Time', subtitle: 'I can cook anytime', icon: 'star-outline', color: '#FFD700' },
  { id: 'under_15', backendValue: 'UNDER_15', title: 'Under 15 minutes', subtitle: 'I need ultra-fast meals', icon: 'flash-outline', color: '#FF9900' },
  { id: '15_30', backendValue: 'UNDER_30', title: '15-30 minutes', subtitle: 'Quick but not rushed', icon: 'timer-outline', color: '#1E90FF' },
  { id: '30_60', backendValue: 'UNDER_60', title: '30-60 minutes', subtitle: 'I have a normal evening', icon: 'time-outline', color: '#2B8255' },
  { id: '1_2_hours', backendValue: 'UNDER_60', title: '1-2 hours', subtitle: 'I enjoy the cooking process', icon: 'restaurant-outline', color: '#D2691E' },
];

export default function CookTimeScreen() {
  const router = useRouter();
  const { profile, setProfile, saveOnboardingStep, saveProfileProgress } = useUserStore();
  const [selectedId, setSelectedId] = useState(profile.cookingTime || '15_30');

  const getCookingTimeValue = () => {
    const option = TIME_OPTIONS.find((o) => o.id === selectedId || o.backendValue === selectedId);
    return option?.backendValue || selectedId;
  };

  const handleContinue = async () => {
    if (!selectedId) return;
    const value = getCookingTimeValue();
    setProfile({ cookingTime: value });
    await saveOnboardingStep(9);
    router.push('/onboarding/cooking-frequency');
  };

  const handleSaveProgress = async () => {
    const value = getCookingTimeValue();
    await saveProfileProgress(8, { cookingTime: value });
  };

  return (
    <OnboardingWrapper
      currentStep="cook-time"
      title="How much time do you have to cook?"
      subtitle="This sets your default time filter"
      onSaveProgress={handleSaveProgress}
    >
      <View style={styles.formContainer}>
        {TIME_OPTIONS.map((option) => {
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
