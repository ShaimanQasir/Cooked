import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { useUserStore } from '../store/useUserStore';
import { useToastStore } from '../store/useToastStore';

const ONBOARDING_STEPS = [
  'details',
  'language',
  'find-us',
  'dietary',
  'allergies',
  'dislikes',
  'skill-level',
  'cook-time',
  'cooking-frequency',
  'portions',
  'cuisines',
  'kitchen',
  'meal-plan-pref',
  'notifications',
  'goals',
  'health-info',
  'loading',
  'ready',
  'save-profile',
  'generating-recipes'
];

interface OnboardingWrapperProps {
  currentStep: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBackPress?: () => void;
  showProgress?: boolean;
  onSaveProgress?: () => Promise<void> | void;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({
  currentStep,
  title,
  subtitle,
  children,
  onBackPress,
  showProgress = true,
  onSaveProgress
}) => {
  const router = useRouter();
  const { saveProfileProgress } = useUserStore();
  const { show } = useToastStore();
  const [saving, setSaving] = React.useState(false);
  
  const stepIndex = ONBOARDING_STEPS.indexOf(currentStep);
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPercent = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (onSaveProgress) {
        await onSaveProgress();
      } else {
        const stepNumber = stepIndex >= 0 ? stepIndex + 1 : 1;
        await saveProfileProgress(stepNumber);
      }
      show('Progress saved successfully!', 'success');
    } catch (err: any) {
      show(err.message || 'Failed to save progress', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Onboarding Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={handleBack} 
            activeOpacity={0.7} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          {showProgress && (
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          )}

          {/* Save Progress Button */}
          <TouchableOpacity 
            onPress={handleSave} 
            activeOpacity={0.7} 
            style={styles.saveButton}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Title & Subtitle */}
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>{title}</Text>
            {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
          </View>

          {/* Children Layout */}
          <View style={styles.childrenContainer}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#F2F1EC',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(198, 58, 47, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 64,
    height: 36,
  },
  saveButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  titleSection: {
    marginTop: 20,
    marginBottom: 28,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 8,
    lineHeight: 22,
  },
  childrenContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default OnboardingWrapper;
