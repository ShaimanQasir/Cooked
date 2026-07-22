import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import OnboardingWrapper from '../../components/OnboardingWrapper';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const router = useRouter();
  const { profile, setProfile, saveOnboardingStep } = useUserStore();
  const enabled = profile.notifications.length > 0;

  const handleToggle = () => {
    setProfile({ notifications: enabled ? [] : ['all'] });
  };

  const handleContinue = async () => {
    await saveOnboardingStep(15);
    router.push('/onboarding/goals');
  };

  return (
    <OnboardingWrapper
      currentStep="notifications"
      title="Stay inspired with new recipes"
      subtitle="Would you like to receive notifications?"
    >
      <View style={styles.formContainer}>
        <TouchableOpacity
          style={[styles.toggleCard, enabled && styles.toggleCardActive]}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <View style={styles.toggleLeft}>
            <View style={[styles.iconCircle, enabled && styles.iconCircleActive]}>
              <Ionicons name={enabled ? 'notifications' : 'notifications-off-outline'} size={24} color={enabled ? Colors.white : Colors.textMuted} />
            </View>
            <View>
              <Text style={styles.toggleTitle}>{enabled ? 'Notifications ON' : 'Notifications OFF'}</Text>
              <Text style={styles.toggleSubtitle}>
                {enabled ? 'You will receive recipe inspiration and reminders' : 'Turn on to get recipe ideas and meal plan reminders'}
              </Text>
            </View>
          </View>
          <View style={[styles.switch, enabled && styles.switchActive]}>
            <View style={[styles.switchThumb, enabled && styles.switchThumbActive]} />
          </View>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="bulb" size={20} color={Colors.warning} />
          <Text style={styles.infoText}>
            You can adjust these anytime in your settings
          </Text>
        </View>
      </View>

      <Button title="Continue" onPress={handleContinue} style={styles.continueButton} />
    </OnboardingWrapper>
  );
}

const styles = StyleSheet.create({
  formContainer: { flex: 1, marginTop: 10, width: '100%' },
  toggleCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1.5,
    borderColor: Colors.border, padding: 16, marginBottom: 16, ...Colors.shadowSubtle,
  },
  toggleCardActive: { borderColor: Colors.primary },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.cardAlt,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  iconCircleActive: { backgroundColor: Colors.primary },
  toggleTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  toggleSubtitle: { fontSize: 13, fontWeight: '500', color: Colors.textMuted, marginTop: 2, maxWidth: 240 },
  switch: {
    width: 52, height: 30, borderRadius: 15, backgroundColor: Colors.border,
    justifyContent: 'center', padding: 2,
  },
  switchActive: { backgroundColor: Colors.primary },
  switchThumb: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  switchThumbActive: { alignSelf: 'flex-end' },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FFE0A3',
  },
  infoText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500', marginLeft: 10, flex: 1 },
  continueButton: { marginTop: 24 },
});
