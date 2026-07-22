import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

interface Option {
  id: string;
  label: string;
  icon: string;
  iconType: 'fa' | 'ion';
  color: string;
}

const FIND_US_OPTIONS: Option[] = [
  { id: 'instagram', label: 'Instagram', icon: 'instagram', iconType: 'fa', color: '#E1306C' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook', iconType: 'fa', color: '#1877F2' },
  { id: 'tiktok', label: 'Tiktok', icon: 'tiktok', iconType: 'fa', color: '#000000' },
  { id: 'google', label: 'Google', icon: 'logo-google', iconType: 'ion', color: '#EA4335' },
  { id: 'friend', label: 'Friend Referral', icon: 'people-outline', iconType: 'ion', color: '#5F5CDE' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline', iconType: 'ion', color: '#7E7C77' },
];

export default function FindUsScreen() {
  const router = useRouter();
  const { profile, setProfile, saveOnboardingStep, saveProfileProgress } = useUserStore();

  const [selectedId, setSelectedId] = useState(profile.referralSource);
  const [specifyText, setSpecifyText] = useState('');

  const getReferralValue = () => {
    return selectedId === 'other' && specifyText.trim()
      ? `other:${specifyText.trim()}`
      : selectedId;
  };

  const handleContinue = async () => {
    if (!selectedId) return;
    const value = getReferralValue();
    setProfile({ referralSource: value });
    await saveOnboardingStep(4);
    router.push('/onboarding/dietary');
  };

  const handleSaveProgress = async () => {
    const value = getReferralValue();
    await saveProfileProgress(3, { referralSource: value });
  };

  const renderIcon = (option: Option, isSelected: boolean) => {
    const size = 28;
    const color = isSelected ? option.color : Colors.textMuted;
    
    if (option.iconType === 'fa') {
      return <FontAwesome5 name={option.icon} size={size} color={color} />;
    }
    return <Ionicons name={option.icon as any} size={size} color={color} />;
  };

  return (
    <OnboardingWrapper
      currentStep="find-us"
      title={`Welcome, ${profile.name || 'Zain'}!\nHow did you find us?`}
      subtitle="This helps us improve our reach"
      onSaveProgress={handleSaveProgress}
    >
      <View style={styles.gridContainer}>
        {FIND_US_OPTIONS.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.gridCard,
                isSelected ? styles.gridCardActive : null
              ]}
              onPress={() => setSelectedId(option.id)}
              activeOpacity={0.8}
            >
              {renderIcon(option, isSelected)}
              <Text style={[styles.cardText, isSelected ? styles.cardTextActive : null]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Conditional Specification Field */}
      {selectedId === 'other' && (
        <View style={styles.specifyContainer}>
          <TextInput
            style={styles.specifyInput}
            placeholder="Please specify..."
            placeholderTextColor={Colors.textLight}
            value={specifyText}
            onChangeText={setSpecifyText}
          />
        </View>
      )}

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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridCard: {
    width: '48%',
    height: 110,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Colors.shadowSubtle,
  },
  gridCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  cardTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  specifyContainer: {
    marginTop: 8,
    width: '100%',
  },
  specifyInput: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  continueButton: {
    marginTop: 32,
  },
});
