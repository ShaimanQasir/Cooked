import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SaveProfileScreen() {
  const router = useRouter();
  const { syncProfileToBackend, completeOnboarding } = useUserStore();
  const [saving, setSaving] = useState(false);

  const handleSaveAndContinue = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await syncProfileToBackend();
      completeOnboarding();
      router.replace('/onboarding/generating-recipes');
    } catch (_) {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Back navigation */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Save your profile,</Text>
          <Text style={styles.subtitleText}>Your 20-step profile is ready to save</Text>
        </View>

        {/* Highlight Feature Checked */}
        <View style={styles.featureBox}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={16} color={Colors.success} />
          </View>
          <Text style={styles.featureText}>
            Pick up exactly where you left off on any device
          </Text>
        </View>

        {/* Free forever badge */}
        <View style={styles.freeBox}>
          <Ionicons name="gift-outline" size={20} color={Colors.success} />
          <Text style={styles.freeText}>
            Cooked is free for everyone. No payment required.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSaveAndContinue}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={Colors.white} size="small" />
              <Text style={styles.saveBtnText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveBtnText}>Save & Continue</Text>
          )}
        </TouchableOpacity>

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
    marginBottom: 20,
  },
  header: {
    marginBottom: 28,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 8,
  },
  featureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D4ECE1',
    padding: 16,
    marginBottom: 16,
    ...Colors.shadowSubtle,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  freeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 130, 85, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 130, 85, 0.15)',
    padding: 16,
    marginBottom: 40,
    gap: 10,
  },
  freeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    lineHeight: 20,
  },
  saveBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
