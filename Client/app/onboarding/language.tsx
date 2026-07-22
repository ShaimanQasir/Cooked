import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import SearchableDropdown from '../../components/SearchableDropdown';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LANGUAGES } from '../../constants/languages';
import { REGIONS } from '../../constants/countries';
import { COUNTRIES } from '../../constants/countries';

export default function LanguageScreen() {
  const router = useRouter();
  const { profile, setProfile, saveOnboardingStep, saveProfileProgress } = useUserStore();

  const [language, setLanguage] = useState(profile.language || 'English');
  const [region, setRegion] = useState(profile.region);
  const [country, setCountry] = useState(profile.country);
  const [measurement, setMeasurement] = useState<'Metric' | 'Imperial'>(profile.measurementSystem);

  const [langDropdown, setLangDropdown] = useState(false);
  const [regionDropdown, setRegionDropdown] = useState(false);
  const [countryDropdown, setCountryDropdown] = useState(false);

  const handleContinue = async () => {
    setProfile({ language, region, country, measurementSystem: measurement });
    await saveOnboardingStep(3); // Step 3: Find Us
    router.push('/onboarding/find-us');
  };

  const handleSaveProgress = async () => {
    await saveProfileProgress(2, { language, region, country, measurementSystem: measurement });
  };

  return (
    <OnboardingWrapper
      currentStep="language"
      title="Language & Region"
      subtitle="We'll use this to suggest local recipes and ingredients available near you"
      onSaveProgress={handleSaveProgress}
    >
      <View style={styles.formContainer}>
        <Text style={styles.dropdownLabel}>Language</Text>
        <TouchableOpacity style={styles.dropdown} activeOpacity={0.8} onPress={() => setLangDropdown(true)}>
          <Text style={styles.dropdownText}>{language || 'Select language'}</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.dropdownLabel}>Country/Region</Text>
        <TouchableOpacity style={styles.dropdown} activeOpacity={0.8} onPress={() => setRegionDropdown(true)}>
          <Text style={[styles.dropdownText, !region && { color: Colors.textLight }]}>
            {region || 'Select region'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.dropdownLabel}>Country</Text>
        <TouchableOpacity style={styles.dropdown} activeOpacity={0.8} onPress={() => setCountryDropdown(true)}>
          <Text style={[styles.dropdownText, !country && { color: Colors.textLight }]}>
            {country || 'Select country'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.measureSystemBox}>
          <Text style={styles.measureSystemTitle}>
            Measurement system: {measurement === 'Imperial' ? 'Imperial (cups, oz, F)' : 'Metric (g, ml, C)'}
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.togglePill, measurement === 'Metric' && styles.togglePillActive]}
            onPress={() => setMeasurement('Metric')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, measurement === 'Metric' && styles.toggleTextActive]}>
              Metric (g, ml, C)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.togglePill, measurement === 'Imperial' && styles.togglePillActive]}
            onPress={() => setMeasurement('Imperial')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, measurement === 'Imperial' && styles.toggleTextActive]}>
              Imperial (cups, oz, F)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Button title="Continue" onPress={handleContinue} style={styles.continueButton} />

      <SearchableDropdown
        visible={langDropdown}
        title="Select Language"
        options={LANGUAGES}
        selected={language}
        onSelect={setLanguage}
        onClose={() => setLangDropdown(false)}
        placeholder="Search languages..."
      />

      <SearchableDropdown
        visible={regionDropdown}
        title="Select Region"
        options={REGIONS}
        selected={region}
        onSelect={setRegion}
        onClose={() => setRegionDropdown(false)}
        placeholder="Search regions..."
      />

      <SearchableDropdown
        visible={countryDropdown}
        title="Select Country"
        options={COUNTRIES}
        selected={country}
        onSelect={setCountry}
        onClose={() => setCountryDropdown(false)}
        placeholder="Search countries..."
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
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  dropdown: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  measureSystemBox: {
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  measureSystemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleContainer: {
    height: 56,
    backgroundColor: Colors.cardAlt,
    borderRadius: 28,
    flexDirection: 'row',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  togglePill: {
    flex: 1,
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  togglePillActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  continueButton: {
    marginTop: 32,
  },
});
