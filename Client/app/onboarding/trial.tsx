import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface TimelineItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ iconName, title, desc, isLast = false }) => (
  <View style={styles.timelineRow}>
    <View style={styles.timelineLeft}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={16} color="#E29E2B" />
      </View>
      {!isLast && <View style={styles.timelineLine} />}
    </View>
    <View style={styles.timelineRight}>
      <Text style={styles.timelineTitle}>{title}</Text>
      <Text style={styles.timelineDesc}>{desc}</Text>
    </View>
  </View>
);

export default function TrialScreen() {
  const router = useRouter();
  const { setProfile, completeOnboarding, syncProfileToBackend } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    setProfile({ isPremium: true });
    await syncProfileToBackend();
    completeOnboarding();
    setLoading(false);
    router.replace('/onboarding/generating-recipes');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Close Button on top-left to skip/exit */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Start your 3-day FREE Trial to continue.</Text>
        </View>

        {/* Vertical timeline details */}
        <View style={styles.timelineContainer}>
          <TimelineItem
            iconName="lock-closed"
            title="Today"
            desc="Unlock all the app's features like AI calorie scanning and more."
          />
          <TimelineItem
            iconName="notifications-outline"
            title="In 2 Days - Reminder"
            desc="We'll send you a reminder that your trial is ending soon."
          />
          <TimelineItem
            iconName="ribbon"
            title="In 3 Days - Billing Starts"
            desc="You'll be charged on Mar 9, 2026 unless you cancel anytime before."
            isLast={true}
          />
        </View>

        {/* Plans Row selector */}
        <View style={styles.plansRow}>
          {/* Monthly */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' ? styles.planCardActive : null
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <View style={styles.radioRow}>
              <Text style={styles.planName}>Monthly</Text>
              <View style={[styles.radio, selectedPlan === 'monthly' ? styles.radioActive : null]}>
                {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.planPrice}>$9.99 /mo</Text>
          </TouchableOpacity>

          {/* Yearly */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' ? styles.planCardActive : null
            ]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.8}
          >
            {/* 3 Days Free highlight badge */}
            <View style={styles.badgeWrapper}>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>3 days free</Text>
              </View>
            </View>

            <View style={styles.radioRow}>
              <Text style={styles.planName}>Yearly</Text>
              <View style={[styles.radio, selectedPlan === 'yearly' ? styles.radioActive : null]}>
                {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.planPrice}>$2.49 /mo</Text>
          </TouchableOpacity>
        </View>

        {/* Sub-label */}
        <View style={styles.noPaymentRow}>
          <Ionicons name="checkmark" size={16} color={Colors.success} />
          <Text style={styles.noPaymentText}>No Payment Due Now</Text>
        </View>

        {/* Main button */}
        <Button
          title="Start My 3-Day Free Trial"
          onPress={handleStartTrial}
          loading={loading}
          disabled={loading}
          style={styles.trialButton}
        />

        {/* Terms detail footer */}
        <Text style={styles.footerTerms}>
          3 days free, then $29.99 per year ($2.49/mo)
        </Text>

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
    paddingTop: 20,
    paddingBottom: 36,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 28,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  timelineContainer: {
    marginBottom: 28,
    paddingLeft: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF9E6',
    borderWidth: 1.5,
    borderColor: '#FFE0A3',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#FFE0A3',
    minHeight: 48,
    marginTop: -2,
    marginBottom: -6,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  timelineDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  plansRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  planCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    position: 'relative',
    height: 100,
    justifyContent: 'center',
    ...Colors.shadowSubtle,
  },
  planCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  badgeWrapper: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  freeBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  freeBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  planName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  noPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  noPaymentText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
    marginLeft: 8,
  },
  trialButton: {
    marginBottom: 16,
  },
  footerTerms: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
