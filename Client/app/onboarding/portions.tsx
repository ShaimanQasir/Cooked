import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface PortionOption {
  id: string;
  backendValue: string;
  title: string;
  subtitle: string;
  icon: string;
  iconFamily: 'ion' | 'mci';
  color: string;
}

const PORTION_OPTIONS: PortionOption[] = [
  { id: '1_person', backendValue: 'SOLO', title: 'Just me', subtitle: '1 person', icon: 'person-outline', iconFamily: 'ion', color: '#8F5FDE' },
  { id: '2_people', backendValue: 'COUPLE', title: 'Two people', subtitle: 'Couple or pair', icon: 'people-outline', iconFamily: 'ion', color: '#FF69B4' },
  { id: '3_4_people', backendValue: 'SMALL_FAMILY', title: '3-4 people', subtitle: 'Small family', icon: 'human-male-female-child', iconFamily: 'mci', color: '#C63A2F' },
  { id: '5_6_people', backendValue: 'LARGE_FAMILY', title: '5-6 people', subtitle: 'Larger family', icon: 'account-group-outline', iconFamily: 'mci', color: '#4682B4' },
  { id: '7_plus_people', backendValue: 'LARGE_FAMILY', title: '7+ people', subtitle: 'Large family or group', icon: 'google-circles-communities', iconFamily: 'mci', color: '#2B8255' },
];

export default function PortionsScreen() {
  const router = useRouter();
  const { profile, setProfile, saveOnboardingStep, saveProfileProgress } = useUserStore();
  const [selectedId, setSelectedId] = useState(profile.cookingFor || '3_4_people');

  const getCookingForValue = () => {
    const option = PORTION_OPTIONS.find((o) => o.id === selectedId || o.backendValue === selectedId);
    return option?.backendValue || selectedId;
  };

  const handleContinue = async () => {
    if (!selectedId) return;
    const value = getCookingForValue();
    setProfile({ cookingFor: value });
    await saveOnboardingStep(11);
    router.push('/onboarding/cuisines');
  };

  const handleSaveProgress = async () => {
    const value = getCookingForValue();
    await saveProfileProgress(10, { cookingFor: value });
  };

  const renderIcon = (option: PortionOption, isSelected: boolean) => {
    const color = isSelected ? option.color : Colors.textMuted;
    if (option.iconFamily === 'ion') {
      return <Ionicons name={option.icon as any} size={28} color={color} />;
    }
    return <MaterialCommunityIcons name={option.icon as any} size={28} color={color} />;
  };

  return (
    <OnboardingWrapper
      currentStep="portions"
      title="How many portions do you cook?"
      subtitle="Helps us customize recipe yield sizes"
      onSaveProgress={handleSaveProgress}
    >
      <View style={styles.formContainer}>
        {PORTION_OPTIONS.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, isSelected && styles.optionCardActive]}
              onPress={() => setSelectedId(option.id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>{renderIcon(option, isSelected)}</View>
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
    flexDirection: 'row', alignItems: 'center', height: 76,
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
