import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface FeatureCardProps {
  title: string;
  desc: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, desc, iconName }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIconBg}>
      <Ionicons name={iconName} size={24} color={Colors.primary} />
    </View>
    <View style={styles.featureTextWrapper}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

export default function ReadyScreen() {
  const router = useRouter();
  const { profile, saveOnboardingStep } = useUserStore();
  
  const favoriteCuisine = profile.favoriteCuisines.length > 0 
    ? profile.favoriteCuisines[0] 
    : 'East African';

  // Capitalize cuisine string for presentation
  const cuisineLabel = favoriteCuisine.charAt(0).toUpperCase() + favoriteCuisine.slice(1);

  const handleUnlock = async () => {
    await saveOnboardingStep(24);
    router.push('/onboarding/save-profile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.titleText}>{profile.name || 'Zain'}, your profile is ready!</Text>
        </View>

        {/* Big Summary Card (Page 21) */}
        <View style={styles.summaryCard}>
          <Text style={styles.largeNumber}>1,847</Text>
          <Text style={styles.numberSubtitle}>recipes personalized just for you</Text>
          
          <View style={styles.cuisineTagWrapper}>
            <Text style={styles.cuisineTagLabel}>Your favorite cuisines:</Text>
            <View style={styles.tagChip}>
              <Text style={styles.tagText}>{cuisineLabel}</Text>
            </View>
          </View>
        </View>

        {/* Key Features List */}
        <Text style={styles.sectionHeading}>Key Features</Text>
        
        <View style={styles.featuresList}>
          <FeatureCard
            title="Scan Ingredients"
            desc="Instantly scan handwritten or printed recipes and convert them into digital format."
            iconName="scan-outline"
          />
          <FeatureCard
            title="Import from Social Media"
            desc="Save recipes directly from Instagram, TikTok, or any platform in one tap."
            iconName="cloud-download-outline"
          />
          <FeatureCard
            title="Personalized for You"
            desc="Get recipe recommendations tailored to your taste, diet, and preferences."
            iconName="sparkles-outline"
          />
        </View>

        {/* Action Button */}
        <Button
          title="Unlock your full Profile →"
          onPress={handleUnlock}
          style={styles.actionButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 24,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    ...Colors.shadow,
  },
  largeNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -1,
  },
  numberSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 6,
    textAlign: 'center',
  },
  cuisineTagWrapper: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1.5,
    borderTopColor: Colors.cardAlt,
    paddingTop: 16,
  },
  cuisineTagLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: Colors.cardAlt,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    ...Colors.shadowSubtle,
  },
  tagText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    ...Colors.shadowSubtle,
  },
  featureIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF1F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  featureDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 16,
  },
});
