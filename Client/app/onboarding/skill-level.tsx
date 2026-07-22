import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SkillOption {
  id: string;
  backendValue: string;
  title: string;
  subtitle: string;
  icon: string;
  iconFamily: 'ion' | 'mci';
  color: string;
}

const SKILL_OPTIONS: SkillOption[] = [
  { id: 'beginner', backendValue: 'BEGINNER', title: 'Total Beginner', subtitle: 'I can barely boil water', icon: 'speedometer-outline', iconFamily: 'ion', color: '#EA4335' },
  { id: 'home_cook', backendValue: 'INTERMEDIATE', title: 'Home Cook', subtitle: 'I follow recipes step by step', icon: 'chef-hat', iconFamily: 'mci', color: '#FF9900' },
  { id: 'confident', backendValue: 'ADVANCED', title: 'Confident Cook', subtitle: 'I improvise and experiment', icon: 'flask-outline', iconFamily: 'ion', color: '#2B8255' },
  { id: 'advanced', backendValue: 'PRO', title: 'Advanced / Semi-Pro', subtitle: 'I want challenging recipes.', icon: 'star', iconFamily: 'ion', color: '#FFD700' },
];

export default function SkillLevelScreen() {
  const router = useRouter();
  const { profile, setProfile, saveOnboardingStep, saveProfileProgress } = useUserStore();
  const [selectedId, setSelectedId] = useState(profile.cookingSkill);

  const getCookingSkillValue = () => {
    const option = SKILL_OPTIONS.find((o) => o.id === selectedId || o.backendValue === selectedId);
    return option?.backendValue || selectedId;
  };

  const handleContinue = async () => {
    if (!selectedId) return;
    const value = getCookingSkillValue();
    setProfile({ cookingSkill: value });
    await saveOnboardingStep(8);
    router.push('/onboarding/cook-time');
  };

  const handleSaveProgress = async () => {
    const value = getCookingSkillValue();
    await saveProfileProgress(7, { cookingSkill: value });
  };

  const renderIcon = (option: SkillOption, isSelected: boolean) => {
    const color = isSelected ? option.color : Colors.textMuted;
    if (option.iconFamily === 'ion') {
      return <Ionicons name={option.icon as any} size={28} color={color} />;
    }
    return <MaterialCommunityIcons name={option.icon as any} size={28} color={color} />;
  };

  return (
    <OnboardingWrapper
      currentStep="skill-level"
      title="What's your cooking skill level?"
      subtitle="We'll match recipes to your experience"
      onSaveProgress={handleSaveProgress}
    >
      <View style={styles.formContainer}>
        {SKILL_OPTIONS.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, isSelected && styles.optionCardActive]}
              onPress={() => setSelectedId(option.id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                {renderIcon(option, isSelected)}
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
    flexDirection: 'row', alignItems: 'center', height: 84,
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
