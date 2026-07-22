import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function DetailsScreen() {
  const router = useRouter();
  const { profile, setProfile, saveOnboardingStep, saveProfileProgress } = useUserStore();

  const [firstName, setFirstName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContinue = async () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.name = 'First name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setProfile({ name: firstName.trim(), email: email.trim() });
    await saveOnboardingStep(2); // Step 2: Language & Region
    router.push('/onboarding/language');
  };

  const handleSaveProgress = async () => {
    await saveProfileProgress(1, { name: firstName.trim(), email: email.trim() });
  };

  return (
    <OnboardingWrapper
      currentStep="details"
      title="Just a few details to get started."
      subtitle="We'll use this to personalize your experience"
      onBackPress={() => router.replace('/')}
      onSaveProgress={handleSaveProgress}
    >
      <View style={styles.formContainer}>
        <Input
          label="First Name"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          placeholder="Your first name"
          error={errors.name}
          leftIcon="person-outline"
        />

        <Input
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          placeholder="Your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          leftIcon="mail-outline"
        />
      </View>

      <Button title="Continue" onPress={handleContinue} style={styles.continueButton} />
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    marginTop: 10,
    width: '100%',
  },
  continueButton: {
    marginTop: 32,
  },
});
