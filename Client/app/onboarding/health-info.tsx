import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface InfoOption {
  id: string;
  backendValue: string;
  label: string;
}

const GENDER_OPTIONS: InfoOption[] = [
  { id: 'male', backendValue: 'MALE', label: 'Male' },
  { id: 'female', backendValue: 'FEMALE', label: 'Female' },
  { id: 'other', backendValue: 'OTHER', label: 'Other' },
  { id: 'prefer_not', backendValue: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const ACTIVITY_OPTIONS: InfoOption[] = [
  { id: 'sedentary', backendValue: 'SEDENTARY', label: 'Sedentary' },
  { id: 'light', backendValue: 'LIGHT', label: 'Lightly Active' },
  { id: 'moderate', backendValue: 'MODERATE', label: 'Moderately Active' },
  { id: 'very_active', backendValue: 'VERY_ACTIVE', label: 'Very Active' },
  { id: 'extreme', backendValue: 'EXTREME', label: 'Extra Active' },
];

const WEIGHT_GOAL_OPTIONS: InfoOption[] = [
  { id: 'lose', backendValue: 'LOSE', label: 'Lose Weight' },
  { id: 'maintain', backendValue: 'MAINTAIN', label: 'Maintain Weight' },
  { id: 'gain', backendValue: 'GAIN', label: 'Gain Weight' },
];

export default function HealthInfoScreen() {
  const router = useRouter();
  const { profile, setProfile, saveOnboardingStep, saveProfileProgress } = useUserStore();

  const [gender, setGender] = useState(profile.gender || '');
  const [dob, setDob] = useState(profile.dob || '');
  const [weight, setWeight] = useState(profile.weight || '');
  const [height, setHeight] = useState(profile.height || '');
  const [activity, setActivity] = useState(profile.activityLevel || '');
  const [weightGoal, setWeightGoal] = useState(profile.weightGoal || '');

  const handleContinue = async () => {
    setProfile({
      gender,
      dob,
      weight,
      height,
      activityLevel: activity,
      weightGoal,
    });
    await saveOnboardingStep(23);
    router.push('/onboarding/loading');
  };

  const handleSaveProgress = async () => {
    await saveProfileProgress(16, {
      gender,
      dob,
      weight,
      height,
      activityLevel: activity,
      weightGoal,
    });
  };

  const renderOptionRow = (options: InfoOption[], selected: string, onSelect: (val: string) => void) => (
    <View style={styles.optionRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          style={[styles.optionPill, selected === opt.backendValue && styles.optionPillActive]}
          onPress={() => onSelect(opt.backendValue)}
          activeOpacity={0.8}
        >
          <Text style={[styles.optionPillText, selected === opt.backendValue && styles.optionPillTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <OnboardingWrapper
      currentStep="health-info"
      title="Health information"
      subtitle="Optional — helps us personalize nutrition suggestions"
      onSaveProgress={handleSaveProgress}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
        <Text style={styles.sectionLabel}>Gender</Text>
        {renderOptionRow(GENDER_OPTIONS, gender, setGender)}

        <Text style={styles.sectionLabel}>Date of Birth</Text>
        <Input
          value={dob}
          onChangeText={setDob}
          placeholder="YYYY-MM-DD"
          leftIcon="calendar-outline"
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.sectionLabel}>Weight (kg)</Text>
            <Input
              value={weight}
              onChangeText={setWeight}
              placeholder="70"
              keyboardType="numeric"
              leftIcon="fitness-outline"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.sectionLabel}>Height (cm)</Text>
            <Input
              value={height}
              onChangeText={setHeight}
              placeholder="175"
              keyboardType="numeric"
              leftIcon="resize-outline"
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Activity Level</Text>
        {renderOptionRow(ACTIVITY_OPTIONS, activity, setActivity)}

        <Text style={styles.sectionLabel}>Weight Goal</Text>
        {renderOptionRow(WEIGHT_GOAL_OPTIONS, weightGoal, setWeightGoal)}
      </ScrollView>

      <Button title="Continue" onPress={handleContinue} style={styles.continueButton} />
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  formContainer: { paddingTop: 10, paddingBottom: 20 },
  sectionLabel: {
    fontSize: 14, fontWeight: '600', color: Colors.textMuted, marginBottom: 10, marginTop: 8,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionPill: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  optionPillActive: { borderColor: Colors.primary, backgroundColor: '#FFF1F0' },
  optionPillText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  optionPillTextActive: { color: Colors.primary },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  continueButton: { marginTop: 16 },
});
